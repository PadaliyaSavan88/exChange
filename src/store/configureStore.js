import { applyMiddleware, compose } from "redux";
import { createStore } from "redux";
import { createLogger } from "redux-logger";
import rootReducer from "./reducer";

const loggerMiddleware = createLogger();
const middleware = []

const composeEnhance = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function configureStore(preLoadedState) {
    return createStore(
        rootReducer,
        preLoadedState,
        composeEnhance(applyMiddleware(...middleware, loggerMiddleware))
    )
}