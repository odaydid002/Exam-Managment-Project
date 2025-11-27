import api from './app'

const authCheck = async (onSuccess = () => {}, onFail = () => {}) => {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const resp = await api.get("/auth/check", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            onSuccess(resp.data.id_utilisateur);
        } catch (err) {
            console.error(err);
            onFail();
        }
    }else{
        onFail();
    }
}

const authLogin = async (data = {email: "", password: ""}, onSuccess = () => {}, onFail = () => {}) => {
    try {
        
      const res = await api.post("/auth/login", data,);
      localStorage.setItem("token", res.data.access_token);
      onSuccess()
    } catch (e) {
      console.error(e);
      onFail();
    }
  };

export {authCheck, authLogin}