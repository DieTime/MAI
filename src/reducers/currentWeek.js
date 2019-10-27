export default function currentWeek(state = null, action) {
    if (action.type === 'chooseWeek') {
        return action.payload;
    }
    return state;
}