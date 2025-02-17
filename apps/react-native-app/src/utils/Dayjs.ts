import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {DEVICE_TIMEZONE} from './Constants';

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault(DEVICE_TIMEZONE);

export default dayjs;
