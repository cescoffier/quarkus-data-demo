package me.escoffier.coffeeshop.model;

public class ProductPrice {

    public String product;
    public double price;

    @Override
    public String toString() {
        return "ProductPrice{" +
                "product='" + product + '\'' +
                ", price=" + price +
                '}';
    }
}
