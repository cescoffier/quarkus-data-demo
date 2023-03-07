package me.escoffier.coffeeshop.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Entity;
import java.time.LocalDateTime;

@Entity
@Table(name = "Orders")
public class Order extends PanacheEntity {

    @CreationTimestamp
    public LocalDateTime time;

    public String product;

    public double price;

}
