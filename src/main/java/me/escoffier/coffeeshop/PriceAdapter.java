package me.escoffier.coffeeshop;

import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.hash.HashCommands;
import io.quarkus.runtime.StartupEvent;
import io.smallrye.common.annotation.Blocking;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.tuples.Tuple2;
import io.smallrye.reactive.messaging.keyed.KeyedMulti;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import me.escoffier.coffeeshop.model.Drink;
import me.escoffier.coffeeshop.model.Order;
import me.escoffier.coffeeshop.model.UpdatePriceCommand;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static io.smallrye.mutiny.tuples.Tuple2.of;
import static java.time.Duration.ofSeconds;
import static java.util.Collections.emptyList;

@ApplicationScoped
public class PriceAdapter {

	private final HashCommands<String, String, Double> hash;
	private final Map<String, Double> basePrices = new ConcurrentHashMap<>();
	private final RedisDataSource ds;


	PriceAdapter(RedisDataSource ds) {
		this.ds = ds;
		this.hash = ds.hash(Double.class);
	}

	public void init(@Observes StartupEvent ev) {
		for (String key : ds.key().keys("drink-*")) {
			Drink drink = ds.json().jsonGetObject(key).mapTo(Drink.class);
			basePrices.put(drink.name, drink.price);
		}
	}

	@Incoming("order-tracking")
	@Outgoing("grouped-orders-by-time-window")
	public Multi<Tuple2<String, List<Order>>> prepare(KeyedMulti<String, Order> orders) {
		return orders
				// For each product, accumulate the orders for 5 seconds
				.group().intoLists().every(ofSeconds(5)).map(list -> of(orders.key(), list))
				// If no orders, for this product, for 10s:
				.ifNoItem().after(ofSeconds(10)).recoverWithMulti(Multi.createFrom().item(of(orders.key(), emptyList())));
	}

	@Incoming("grouped-orders-by-time-window")
	@Outgoing("price-update")
	@Blocking
	public UpdatePriceCommand analyze(Tuple2<String, List<Order>> lastOrderByProduct) {
		String product = lastOrderByProduct.getItem1();
		int numberOfOrderInTheTimeWindow = lastOrderByProduct.getItem2().size();

		double basePrice = basePrices.get(product);
		var currentPrice = getCurrentPrice(product);

		if (numberOfOrderInTheTimeWindow > 3) {
			// We increase the price by 0.5.
			var command = new UpdatePriceCommand(product, currentPrice + 0.5);
			setCurrentPrice(command.product, command.price);
			return command;
		} else {
			// We decrease the price by 0.5, except if lower than the base price
			var newPrice = currentPrice - 0.5;
			if (newPrice >= basePrice) {
				var command = new UpdatePriceCommand(product, newPrice);
				setCurrentPrice(command.product, command.price);
				return command;
			} else {
				// We keep the price unchanged
				return null;
			}
		}
	}

	private double getCurrentPrice(String product) {
		Double d = hash.hget("current-prices", product);
		if (d == null) {
			return basePrices.get(product);
		} else {
			return d;
		}
	}

	private void setCurrentPrice(String product, double price) {
		hash.hset("current-prices", product, price);
	}
}

