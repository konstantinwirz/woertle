import React, {createContext, Dispatch, FC, SetStateAction, useContext, useState} from "react";

type Context = {
	readonly message: string
	readonly setMessage: Dispatch<SetStateAction<string>>
}

export const SnackbarContext = createContext<Context>({
	message: "",
	setMessage: (ignored: string) => {}
} as Context);

export const useSnackbarContext = () => useContext(SnackbarContext);

export const SnackbarContextProvider: FC = ({children}) => {
	const [message, setMessage] = useState<string>("");

	setTimeout(() => setMessage(""), 3000);

	return (
		<SnackbarContext.Provider value={{message, setMessage}}>
			{children}
		</SnackbarContext.Provider>
	);
}