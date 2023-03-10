package me.escoffier.coffeeshop.model;

public class UpdatePriceCommand {

    public String product;
    public double price;

    public UpdatePriceCommand(String product, double price) {
        this.product = product;
        this.price = price;
    }

    public UpdatePriceCommand() {

    }

    @Override
    public String toString() {
        return "ProductPrice{" +
                "product='" + product + '\'' +
                ", price=" + price +
                '}';
    }
}
