import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";

function Callback() {
    const router = useRouter();
    const [login, setLogin] = useState<string>();
    const [showCodeInput, setShowCodeInput] = useState<boolean>(false);
    const [verCode, setVerCode] = useState('');

    const code = router.query.code as string;

    const authLogin = async () => {
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
        if (storedIsLoggedIn === 'true') {
            router.push('Home');
        }
        const response = await(await fetch('http://localhost/api/auth/login?code=' + code)).json();
        const data = await response.json();
        if (response.statusCode === 500) {
            router.push('/');
        }
        setLogin(data.message);
        localStorage.setItem("nickname", data.nickname);
        localStorage.setItem("id", data.id);
        if (data.is2faEnabled === false) {
            localStorage.setItem('isLoggedIn', 'true');
            router.push('Home');
        } else {
            setShowCodeInput(true);
        }
    }

    useEffect(() => {
        authLogin();
    }, []);

    function sendAuthCode(code: string) {
        const authcode = code;
        setVerCode('');
        if (authcode.length !== 6) { // 코드 길이 확인
            alert("Error: Code length error");
            return;
        }

        fetch('http://localhost/api/2fa/authenticate', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                twoFactorAuthCode: authcode,
                id: localStorage.getItem("id"),
            }),
        })
            .then((response) => {
                if (!response.ok) { // response가 제대로 오지않았을때
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then((responseData) => { // 결과를 받음
                //결과 받아서 nickname, profileURL, isLoggedIn 넣어주기
                console.log('Response from server:', responseData);
                localStorage.setItem('isLoggedIn', 'true');
                router.push('/Home');
            })
            .catch((error) => { // 에러시
                console.error('Error sending data:', error);
                setVerCode('');
                setLogin(error);
            });
    };

    // redirect
    if (code) {
        return (
            <>
                <div>
                    로딩중..
                </div>
                <div>
                    {showCodeInput && (
                        <>
                            <input placeholder="띄워쓰기 제외한 6자리" type="text" value={verCode} onChange={(e) => setVerCode(e.target.value)} />
                            <button onClick={() => sendAuthCode(verCode)}>인증</button>
                        </>
                    )}
                </div>
            </>
        );
    }
    return (
        <div>
            <h1>No code</h1>
        </div>
    );
}

export default Callback;
