import {combineReducers} from 'redux';
import group from './group'
import currentWeek from './currentWeek'

export default combineReducers({
    group,
    currentWeek,
})