package me.escoffier.coffeeshop;

import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.json.JsonCommands;
import io.quarkus.redis.datasource.sortedset.ScoredValue;
import io.quarkus.redis.datasource.sortedset.SortedSetCommands;
import io.quarkus.redis.datasource.sortedset.ZRangeArgs;
import io.smallrye.common.annotation.Blocking;
import io.smallrye.reactive.messaging.MutinyEmitter;
import io.smallrye.reactive.messaging.kafka.Record;
import me.escoffier.coffeeshop.model.Drink;

import jakarta.enterprise.context.ApplicationScoped;
import me.escoffier.coffeeshop.model.Order;
import me.escoffier.coffeeshop.model.UpdatePriceCommand;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class CoffeeShop {

    private final RedisDataSource redis;

    public CoffeeShop(RedisDataSource ds) {
        redis = ds;
    }

    public List<Drink> getAllDrinks() {
        List<Drink> drinks = new ArrayList<>();
        for (String key : redis.key().keys("drink-*")) {
            drinks.add(redis.json().jsonGetObject(key).mapTo(Drink.class));
        }
        return drinks;
    }

    public void onOrder(Order order) {
        updateTop3Products(order);
        sendOrderToKafka(order);
    }

    private void updateTop3Products(Order order) {
        // top-products -> sorted set of product name (set of [product, score])
        redis.sortedSet(String.class).zincrby("top-products", 1, order.product);
    }

    public List<ScoredValue<String>> getTop3Products() {
        return redis.sortedSet(String.class).zrangeWithScores("top-products", 0, 2, new ZRangeArgs().rev());
    }

    public List<Drink> search(String query) {
        return redis.search().ftSearch("drinks-index", query).documents()
                .stream()
                .map(document -> document.property("$").asJsonObject()) // Get JSON root
                .map(json -> json.mapTo(Drink.class))
                .collect(Collectors.toList());
    }

    // --- Kafka

    @Channel("orders")
    MutinyEmitter<Record<String, Order>> emitter;

    public void sendOrderToKafka(Order order) {
        // send a record or product - order
        emitter.sendAndAwait(Record.of(order.product, order));
    }

    @Incoming("prices")
    @Outgoing("drinks")
    @Blocking
    List<Drink> onPriceUpdate(UpdatePriceCommand pp) {
        for (String key : redis.key().keys("drink-*")) {
            if (pp.product.equals(redis.json().jsonGetObject(key).mapTo(Drink.class).name)) {
                redis.json().jsonSet(key, "$.price", pp.price);
                return getAllDrinks();
            }
        }
        return getAllDrinks();
    }


}
