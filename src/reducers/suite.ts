const devices = (state = [], action: any) => {
    if (action.type === 'DEVICE_CONNECT') {
        return [
            ...state,
            action.device
        ];
    }
    return state;
}

export default {
    devices,
};