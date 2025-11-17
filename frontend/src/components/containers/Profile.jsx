import image from '/images/anonymous-boy.png'

function Profile({id="", width="30px", classes="", mrg="0", img=image, nav=false}) {
    const styles = {
        width: `${width}`,
        flex: "0 0 auto",
    };
    return ( 
        <div className={`flex center ${classes}`} style={nav?{width: "var(--sidebar-width)", margin: `${mrg}`}:{margin: `${mrg}`}}>
            <div id={id} style={styles} className={`flex center overflow-h circle`}>
                <img className="full" src={img} alt="Profile" />
            </div>
        </div>
     );
}

export default Profile;