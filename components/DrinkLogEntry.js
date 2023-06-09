import {Text, View, StyleSheet} from 'react-native';
import {lowerCase} from 'lodash';
import COLORS from '../theme/Colors';
import {UNITS} from '../utils/Constants';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.iceBlue,
    borderColor: COLORS.primaryFaded,
    borderRadius: 15,
    borderWidth: 2,
    margin: 10,
  },
  entry: {
    color: COLORS.primary,
    fontSize: 24,
    padding: 10,
  },
});

const TIME = {
  AM: 'AM',
  PM: 'PM',
};

export default function DrinkLogEntry({drinkEntry, unit}) {
  const formatTime = time => {
    const hour = parseInt(time.slice(0, time.indexOf(':')), 10);
    if (hour === 0) return `12${time.slice(time.indexOf(':'))} ${TIME.AM}`;
    if (hour === 12) return `${time} ${TIME.PM}`;
    return hour > 12
      ? `${(hour - 12).toString() + time.slice(time.indexOf(':'))} ${TIME.PM}`
      : `${time} ${TIME.AM}`;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.entry}>
        You drank {drinkEntry.drinkAmount}{' '}
        {unit === UNITS.usSystem ? UNITS.oz : UNITS.ml} of{' '}
        {lowerCase(drinkEntry.drinkType)}
        {'\n'}
        at {formatTime(drinkEntry.drinkTime)}.
      </Text>
    </View>
  );
}
