import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import { persistReducer,persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import themeReducer from './theme/themeSlice';


const rootReducer = combineReducers({   //combineReducers - combines all reducers into one
    user: userReducer,
    theme: themeReducer,
});

const persistConfig = {       //persistConfig - configuration object for redux-persist
    key: 'root',
    storage,
    version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);     //persistedReducer - a higher order reducer that persists the state

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({      //getDefaultMiddleware - returns an array of default middlewares
        serializableCheck: false,
    }),
});

export const persistor = persistStore(store);     //persistor - a persisted store