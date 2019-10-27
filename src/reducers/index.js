import {combineReducers} from 'redux';
import group from './group'
import currentWeek from './currentWeek'
import id from './id'

export default combineReducers({
    group,
    id,
    currentWeek,
})