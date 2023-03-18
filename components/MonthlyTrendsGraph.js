import {StyleSheet, View} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import GraphLegend from './GraphLegend';

const styles = StyleSheet.create({
  container: {paddingHorizontal: 20},
  xAxisLegendStyle: {
    marginLeft: 10,
  },
  yAxisTextStyle: {
    fontSize: 15,
  },
});

export default function MonthlyTrendsGraph({data, maxValue}) {
  return (
    <View style={styles.container}>
      <GraphLegend />
      <BarChart
        data={data}
        initialSpacing={25}
        spacing={13}
        barWidth={15}
        xAxisThickness={1}
        yAxisThickness={1}
        yAxisTextStyle={styles.yAxisTextStyle}
        noOfSections={7}
        maxValue={maxValue}
        labelWidth={85}
        height={380}
        autoShiftLabels
        xAxisLabelTextStyle={styles.xAxisLegendStyle}
      />
    </View>
  );
}
