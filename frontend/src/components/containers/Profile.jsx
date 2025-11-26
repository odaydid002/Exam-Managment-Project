import image from '/images/anonymous-boy.png'
import { useState } from 'react'

function Profile({
    id = "",
    width = "30px",
    classes = "",
    mrg = "0",
    img = image,
    nav = false,
    border = "none",
    top = null,
    right = null,
    bottom = null,
    left = null,
    onClick = () => {}
}) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const styles = {
        width: width,
        border: !loading? border:"none",
        flex: "0 0 auto",
    };

    return (
        <div
            onClick={onClick}
            className={`flex center ${classes}`}
            style={
                nav
                    ? {
                        width: "var(--sidebar-width)",
                        margin: mrg,
                        top, bottom, right, left
                    }
                    : {
                        margin: mrg,
                        top, bottom, right, left
                    }
            }
        >
            <div
                id={id}
                style={styles}
                className={`flex center overflow-h circle ${loading ? "shimmer" : ""}`}
            >
                <img
                    className="full"
                    src={error ? image : img}
                    alt="Profile"
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setError(true);
                        setLoading(false);
                    }}
                    style={{ display: loading ? "none" : "block" }}
                />
                {loading && (
                    <div className="full shimmer"></div>
                )}
            </div>
        </div>
    );
}

export default Profile;
