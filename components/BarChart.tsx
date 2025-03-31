import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;
const barCount = 10;
// // const barWidth = (screenWidth - 80) / barCount; // 40 padding mỗi bên
// const barWidth = 18;
const barRadius = 12; // Bo góc 1/2 chiều rộng

const data = {
    labels: ["08h", "09h", "10h", "11h", "12h", "13h", "14h", "15h", "16h"],
    datasets: [
        {
            data: [4, 6, 5, 7, 8, 3, 6, 5, 9],
            colors: Array(barCount).fill(null).map((_, i) =>
                i % 2 === 0
                    ? (opacity = 1) => `#1B1A18`
                    : (opacity = 1) => `#C3934F`
            )
        }
    ]
};


const CustomBarChart = () => {
    return (
            <BarChart
                data={data}
                width={screenWidth}
                height={220}
                yAxisLabel="" // Thêm vào đây
                yAxisSuffix="" // Thêm vào đây
                chartConfig={{
                    backgroundGradientFrom: "#f2f2f2",
                    backgroundGradientTo: "#f2f2f2",
                    decimalPlaces: 0,
                    barPercentage: 0.8,                
                    // propsForBars :{
                    //     width: 40,
                    // },
                    propsForBackgroundLines: {
                        strokeWidth: 0
                    },
                    color: () => `transparent`,
                    barRadius: barRadius, 
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}

                withHorizontalLabels={false}  // Ẩn các số trên trục y
                withVerticalLabels={true}       // Giữ các nhãn trên trục x nếu cầ
                style={styles.chart}
                fromZero
                showBarTops={false}
                flatColor
                withCustomBarColorFromData
            />
    );
};
const styles = StyleSheet.create({
    // container: {
    //     marginVertical: 10,
    //     borderRadius: 10,
    //     alignSelf: "auto",
    //     backgroundColor: "rgba(255, 65, 65, 0.89)",
    //     // Điều chỉnh padding nếu cần
    //     paddingLeft: 0,









    
    // },
    chart: {
        // padding:16,
        left:-40,
        borderRadius: 3,
        backgroundColor: "transparent",
    }
});
export default CustomBarChart;