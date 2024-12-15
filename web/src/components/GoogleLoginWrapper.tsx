import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

type GoogleLoginWrapperProps = {
    onSuccess: (response: CredentialResponse) => void;
    onError: () => void;
};

export const GoogleLoginWrapper = ({ onSuccess, onError }: GoogleLoginWrapperProps) => {
    return (
        <div className="mt-4">
            <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
            />
        </div>
    );
};
