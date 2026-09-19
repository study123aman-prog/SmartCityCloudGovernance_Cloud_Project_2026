/**
 * FireGuard AI - Notification Service (Local Implementation)
 * 
 * NOTE FOR FUTURE AWS INTEGRATION:
 * This local service can later be connected to AWS SNS by implementing
 * the SNS publish command. For now, alerts are logged locally and
 * stored in the LocalAlertRepository.
 */

export function createNotificationService({ threshold = 65, alertRepository = null } = {}) {
  return {
    isThresholdCrossed({ probability }) {
      return Number(probability) * 100 >= threshold;
    },

    async notifyRisk({ userEmail, prediction, probability, modelVersion }) {
      const score = Math.round(Number(probability) * 100);
      const isCritical = score >= 80;
      const severity = isCritical ? 'CRITICAL' : 'WARNING';

      console.log(`[LocalNotificationService] Alert for ${userEmail || 'operator'}: Fire risk score=${score} (${severity})`);

      if (alertRepository) {
        await alertRepository.saveAlert({
          severity,
          title: `${severity}: Elevated Fire Risk Detected`,
          message: `Fire risk probability reached ${(probability * 100).toFixed(1)}% (Model ${modelVersion || '2.0'})`,
          score,
          source: 'prediction_pipeline',
          metadata: { userEmail, prediction, modelVersion },
        });
      }

      return {
        sent: true,
        channel: 'local_console_and_repository',
        note: 'Local notification generated without external cloud SNS dispatch.',
      };
    },
  };
}
