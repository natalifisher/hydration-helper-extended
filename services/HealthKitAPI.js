import AppleHealthKit from 'react-native-health';

class HealthAPI {
  options = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        AppleHealthKit.Constants.Permissions.Sodium,
        AppleHealthKit.Constants.Permissions.AppleExerciseTime,
        AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
        AppleHealthKit.Constants.Permissions.EnergyConsumed,
        AppleHealthKit.Constants.Permissions.Protein,
      ],
    },
    startDate: new Date(2020, 1, 1).toISOString(),
  };

  init() {
    AppleHealthKit.initHealthKit(this.options, error => {
      if (error) console.log('[ERROR] Cannot grant permissions!');
    });
  }

  energyConsumed(setCalories) {
    const calorieIntake = AppleHealthKit.getEnergyConsumedSamples(
      this.options,
      (err, results) => {
        if (err) {
          return;
        }
        let todayCalories = 0;
        const historicalCalories = {};
        results.forEach(entry => {
          const daysBefore =
            new Date().getDate() - new Date(entry.startDate).getDate();
          if (daysBefore === 0) {
            todayCalories += entry.value;
          } else if (daysBefore in historicalCalories) {
            historicalCalories[daysBefore] += entry.value;
          } else {
            historicalCalories[daysBefore] = entry.value;
          }
        });
        const average = array => array.reduce((a, b) => a + b) / array.length;
        const averageCalories = average(Object.values(historicalCalories));
        setCalories({today: todayCalories, average: averageCalories});
      },
    );

    return calorieIntake;
  }

  protein(setProtein) {
    AppleHealthKit.getProteinSamples(this.options, (err, results) => {
      if (err) {
        return;
      }
      let todayProtein = 0;
      const historicalProtein = {};
      results.forEach(entry => {
        const daysBefore =
          new Date().getDate() - new Date(entry.startDate).getDate();
        if (daysBefore === 0) {
          todayProtein += entry.value;
        } else if (daysBefore in historicalProtein) {
          historicalProtein[daysBefore] += entry.value;
        } else {
          historicalProtein[daysBefore] = entry.value;
        }
      });
      const average = array => array.reduce((a, b) => a + b) / array.length;
      const averageProtein = average(Object.values(historicalProtein));
      setProtein({today: todayProtein, average: averageProtein});
    });
  }
}

export default HealthAPI;
