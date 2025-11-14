import image from '/images/anonymous-boy.png'

function Profile(props) {
    const styles = {
        width: `${props.width}px`,
        flex: "0 0 auto",
    };
    return ( 
        <div className={`flex center ${props.classes || ""}`} style={{width: "var(--sidebar-width)", margin: `${props.mrg}`}}>
            <div id={props.id} style={styles} className={`flex center overflow-h circle`}>
                <img className="full" src={props.image || image} alt="Profile" />
            </div>
        </div>
     );
}

export default Profile;