export default function group(state = "", action) {
    if (action.type === 'selectGroup') {
        return action.payload;
    }
    return state;
}