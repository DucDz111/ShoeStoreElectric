package org.example.shoestorebackend.entity;

import java.util.List;

public class RevenueChartData {
    private List<String> labels;
    private List<Double> data;

    // Getters and Setters
    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }
    public List<Double> getData() { return data; }
    public void setData(List<Double> data) { this.data = data; }
}
