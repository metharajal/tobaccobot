import sg, { call } from 'sg/sg';
import exit from './services/exit';
import generatorToCPS from './utils/generatorToCPS';

import getUser from './effects/getUser';
import qualifyUser from './effects/qualifyUser';
import updateUser from './effects/updateUser';
import sendDubiousMessage from './effects/sendDubiousMessage';
import sendQualifiedMessage from './effects/sendQualifiedMessage';
import computeTargetConsumption from './effects/computeTargetConsumption';

export function* botConversationSaga(message) {
    const user = yield call(getUser, message.user);

    if (user && user.state === 'welcomed') {
        const { state, nbCigarettes } = yield call(qualifyUser, user, message);

        switch (state) {
        case 'dubious': {
            yield call(updateUser, { ...user, state });

            yield call(sendDubiousMessage, user);
            break;
        }
        case 'qualified': {
            const targetConsumption = yield call(computeTargetConsumption, nbCigarettes);

            yield call(updateUser, {
                ...user,
                remainingDays: 28,
                state,
                targetConsumption,
            });

            yield call(sendQualifiedMessage, targetConsumption);
            break;
        }
        default:
            throw new Error('Invalid user state');
        }
    }
}

export function* botConversation({ body }) {
    try {
        yield sg(botConversationSaga)(body);

        return {
            statusCode: 200,
            headers: { },
            body: 'Ok',
        };
    } catch (error) {
        console.error({ error });

        exit(1);
        return {
            statusCode: 500,
            headers: { },
            body: error.message,
        };
    }
}

export default generatorToCPS(botConversation);
