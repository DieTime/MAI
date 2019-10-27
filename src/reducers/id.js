export default function id(state = null, action) {
    if (action.type === 'selectId') {
        return action.payload;
    }
    return state;
}