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
import me.escoffier.coffeeshop.model.ProductPrice;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class CoffeeShop {

    private final JsonCommands<String> json;
    private final RedisDataSource redis;
    private SortedSetCommands<String, String> sortedSet;

    public CoffeeShop(RedisDataSource ds) {
        redis = ds;
        json = ds.json(String.class);
        sortedSet = redis.sortedSet(String.class);
    }


    public List<Drink> getAllDrinks() {
        List<Drink> drinks = new ArrayList<>();
        for (String key : redis.key().keys("drink-*")) {
            drinks.add(json.jsonGetObject(key).mapTo(Drink.class));
        }
        return drinks;
    }

    public void onOrder(Order order) {
        updateTop3Products(order);
        sendMessage(order);
    }

    private void updateTop3Products(Order order) {
        sortedSet.zincrby("top-products", 1, order.product);
    }

    public List<ScoredValue<String>> getTop3Products() {
        return sortedSet.zrangeWithScores("top-products", 0, 2, new ZRangeArgs().rev());
    }

    public List<Drink> search(String query) {
        return redis.search().ftSearch("drinks-index", query).documents()
                .stream()
                .map(document -> document.property("$").asJsonObject()) // Get JSON root
                .map(json -> json.mapTo(Drink.class))
                .collect(Collectors.toList());
    }

    @Channel("orders")
    MutinyEmitter<Record<String, Order>> emitter;

    public void sendMessage(Order order) {
        emitter.sendAndAwait(Record.of(order.product, order));
    }


    @Incoming("prices")
    @Outgoing("drinks")
    @Blocking
    List<Drink> onPriceUpdate(ProductPrice pp) {
        System.out.println("receiving price update: " + pp);
        for (String key : redis.key().keys("drink-*")) {
            if (pp.product.equals(json.jsonGetObject(key).mapTo(Drink.class).name)) {
                json.jsonSet(key, "$.price", pp.price);
            }
        }
        return getAllDrinks();
    }


}
