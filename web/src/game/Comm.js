export const OpCode = {
    ACCOUNT_LOGIN:      2,
    ACCOUNT_LOGOUT:     3,
    CHARACTER_LIST:     4,
    CHARACTER_CREATE:   5,
    CHARACTER_SELECT:   6,
    CHARACTER_DELETE:   7,
    ENTER_MAP:          8,
    ENTER_INSTANCE:     9,
    CHAT_MESSAGE:       10,
    OBJECT_CREATE:      11,
    OBJECT_DELETE:      12,
    OBJECT_UPDATE:      13,
    OBJECT_STATS:       14,
    FX_CREATE:          15,
    ABILITY_LIST:       16,
    ABILITY_UPGRADE:    17,
    ABILITY_CAST:       18,
    SKIN_PURCHASE:      19,
    SKIN_CHANGE:        20,
    INVITE_SEND:        21,
    INVITE_NOTIFY:      22,
    INVITE_REPLY:       23,
    INVITE_RESPONSE:    24,
    BAD_REQUEST:        99

}

export const Status = {
    GOOD: "ok",
    BAD: "bad"
};

export const MSG_DELIM = "?&?";