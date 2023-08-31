package me.escoffier.coffeeshop;

import io.quarkus.logging.Log;
import io.quarkus.panache.common.Sort;
import io.quarkus.redis.datasource.sortedset.ScoredValue;
import io.smallrye.mutiny.Multi;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import me.escoffier.coffeeshop.model.Drink;
import me.escoffier.coffeeshop.model.Order;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import org.eclipse.microprofile.reactive.messaging.Channel;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Path("/coffeeshop")
public class CoffeeShopResource {

    final CoffeeShop coffeeShop;

    public CoffeeShopResource(CoffeeShop coffeeShop) {
        this.coffeeShop = coffeeShop;
    }

    // -------- Hibernate / Panache ----

    @GET
    @Path("/drinks")
    public List<Drink> getAllDrinks() {
        return coffeeShop.getAllDrinks();
    }

    @POST
    @Transactional
    @Path("/orders")
    public void buy(Order order) {
      // persist and call onOrder
        order.persist();
        coffeeShop.onOrder(order);
    }

    @GET
    @Path("/orders")
    public List<Order> getAllOrders() {
        // stream by descending time and get the first 5
        return Order.<Order>streamAll(Sort.by("time", Sort.Direction.Descending))
                .limit(5).collect(Collectors.toList());
    }

    // -------- NoSQL ----

    @GET
    @Path("/top")
    public List<ScoredValue<String>> getTopProducts() {
        return coffeeShop.getTop3Products();
    }

    @GET
    @Path("/query")
    public List<Drink> search(@QueryParam("query") String query) {
        return coffeeShop.search(query);
    }

    // -------- Kafka -------

    @Channel("drinks")
    Multi<List<Drink>> drinks;

    @GET
    @Path("/prices")
    @Produces(MediaType.SERVER_SENT_EVENTS)
    public Multi<List<Drink>> updatedDrinks() {
        return drinks;
    }
}
