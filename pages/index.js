import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import { addUser, testContract } from "../utils/contract.utils";

const PrimaryButton = ({ name, clickEvent, disabled = false }) => (
  <button onClick={() => clickEvent()} className="button" disabled={disabled}>
    {name}
  </button>
);

export default function Home() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isChainValid, setIsChainValid] = useState(null);
  const [loading, setLoading] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState("");
  const [userList, setUserList] = useState([]);
  const [totalUsers, setTotalusers] = useState(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const isValid = { fname: false, lname: false };

  useEffect(() => {
    setIsInstalled(window.ethereum);
    setIsChainValid(
      parseInt(ethereum.chainId) == process.env.NEXT_PUBLIC_VALID_CHAINID
    ); // to show netwrk on 1st load

    listenNetworkChange();
    listenAccountChange();
  }, []);

  const mintNow = async () => {
    try {
      setLoading(true);
      const { detailsArr, personCount } = await testContract();
      setUserList(detailsArr);
      setTotalusers(personCount);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
    }
  };

  const listenAccountChange = async () => {
    try {
      await ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setConnectedAccount(accounts[0]);
        } else {
          setConnectedAccount("");
          setIsConnected(false);
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const listenNetworkChange = async () => {
    try {
      await ethereum.on("chainChanged", (chainId) => {
        setIsChainValid(
          parseInt(chainId) == process.env.NEXT_PUBLIC_VALID_CHAINID
        );
      });
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      const connectedAccounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setLoading(false);
      setIsConnected(true);
      setConnectedAccount(connectedAccounts[0]);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setIsConnected(false);
      setConnectedAccount("");
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    handleValidation();
    if (isValid.fname && isValid.lname) {
      try {
        setLoading(true);
        const fName = firstNameRef.current.value.trim();
        const lName = lastNameRef.current.value.trim();
        const resp = await addUser(fName, lName);
        resetInputState();
        setLoading(false);
        if (resp) {
          alert("request successfully submitted");
        }
      } catch (error) {
        setLoading(false);
        console.error(error);
        alert("Oops!! Transaction Failed");
      }
    }
  };

  const handleValidation = () => {
    const minLength = 2;
    if (
      firstNameRef.current.value.trim() !== "" &&
      firstNameRef.current.value.length > minLength
    ) {
      firstNameRef.current.className = "validInput";
      isValid.fname = true;
    } else {
      isValid.fname = false;
      firstNameRef.current.className = "invalidInput";
    }

    if (
      lastNameRef.current.value.trim() !== "" &&
      lastNameRef.current.value.length > minLength
    ) {
      lastNameRef.current.className = "validInput";
      isValid.lname = true;
    } else {
      isValid.lname = false;
      lastNameRef.current.className = "invalidInput";
    }
  };

  const resetInputState = () => {
    firstNameRef.current.value = "";
    lastNameRef.current.value = "";
    firstNameRef.current.className = "inputBox";
    lastNameRef.current.className = "inputBox";
  };

  const appHeading = [
    "Welcome to ",
    <a href="#" key="1">
      Test DApp!
    </a>,
  ];

  const connectedAddress = [
    <b key="1">Connected Address: </b>,
    connectedAccount,
  ];

  return (
    <div className={styles.container}>
      <Head>
        <title>Test DApp site</title>
        <meta name="description" content="Generated for Test purpose" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          {loading ? "Please Wait!!" : appHeading}
        </h1>

        {isConnected ? (
          <div style={{ display: "flex", marginTop: "2rem" }}>
            <form onSubmit={submitForm}>
              <input
                type="text"
                className="inputBox"
                name="fname"
                ref={firstNameRef}
                disabled={loading || !isChainValid}
                placeholder="firstname (min 3 chars)"
              />
              <input
                type="text"
                className="inputBox"
                name="lname"
                ref={lastNameRef}
                disabled={loading || !isChainValid}
                placeholder="lastname (min 3 chars)"
              />
              <PrimaryButton
                name="Add User"
                disabled={loading || !isChainValid}
                clickEvent={() => null}
              />
            </form>
          </div>
        ) : (
          <></>
        )}

        <p className={styles.description}>
          {isConnected
            ? connectedAddress
            : "Get started by connecting your wallet"}
        </p>

        {!isInstalled ? (
          <h2>Install Metamask First!!</h2>
        ) : (
          <div style={{ display: "flex" }}>
            {isConnected ? (
              <PrimaryButton
                name="Fetch List"
                disabled={loading || !isChainValid}
                clickEvent={() => mintNow()}
              />
            ) : (
              <PrimaryButton
                name="Connect Wallet"
                disabled={loading || !isChainValid}
                clickEvent={connectWallet}
              />
            )}
          </div>
        )}

        <div style={{ display: "flex" }}>
          {
            <p className={styles.description}>
              <i>
                <b>Network: </b>
              </i>
              {isChainValid ? "Valid" : "Please Select Rinkeby Network!"}
            </p>
          }

          {totalUsers && (
            <p className={styles.description}>
              TotalUsers:
              <b> {totalUsers}</b>
            </p>
          )}
        </div>

        {totalUsers && (
          <ul className="list">
            <span className="list-title">
              <b>Users-list: (Full Name)</b>
            </span>
            {userList.map((user) => {
              return <li key={user.fname}>{user.fname + " " + user.lname}</li>;
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
