package me.escoffier.coffeeshop.model;

public class Drink {

    public String name;
    public double price;

    public String description;

    public String picture;

    public Drink() {

    }

    public Drink(String name, String description, double price) {
        this.name = name;
        this.description = description;
        this.price = price;
    }
}
