package me.escoffier.coffeeshop;

import io.quarkus.redis.datasource.RedisDataSource;
import io.smallrye.mutiny.Multi;
import io.smallrye.reactive.messaging.kafka.Record;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import me.escoffier.coffeeshop.model.Drink;
import me.escoffier.coffeeshop.model.Order;
import me.escoffier.coffeeshop.model.ProductPrice;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;

import java.time.Duration;

@ApplicationScoped
public class PriceAdapter {

    @Incoming("order-tracking")
    @Outgoing("price-update")
    public Multi<ProductPrice> updatePrice(Multi<Order> orders) {
        return orders
                .group().by(order -> order.product)
                .onItem().transformToMultiAndMerge(ordersByProduct -> ordersByProduct
                        .group().intoLists().every(Duration.ofSeconds(10))
                        .onItem().transformToMultiAndMerge(ordersByProductInTimeWindow -> {
                            if (ordersByProductInTimeWindow.size() > 3) {
                                ProductPrice pp = new ProductPrice();
                                pp.product = ordersByProductInTimeWindow.get(0).product;
                                pp.price = ordersByProductInTimeWindow.get(0).price + 0.5;
                                return Multi.createFrom().item(pp);
                            } else {
                                return Multi.createFrom().empty();
                            }
                        }));
    }
}
