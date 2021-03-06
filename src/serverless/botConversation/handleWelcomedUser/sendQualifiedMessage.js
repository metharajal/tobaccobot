import sendSms from '../../services/sendSms';
import qualifiedMessage from './qualified';

export const sendQualifiedMessageFactory = send => (phone, targetConsumption) =>
    send(phone, qualifiedMessage(targetConsumption));

export default sendQualifiedMessageFactory(sendSms);
