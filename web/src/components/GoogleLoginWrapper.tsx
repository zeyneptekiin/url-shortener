import {GoogleLogin} from "@react-oauth/google";

export const GoogleLoginWrapper = ({ onSuccess, onError }: any) => {
    return (
        <div className="mt-4">
            <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
            />
        </div>
    );
};
