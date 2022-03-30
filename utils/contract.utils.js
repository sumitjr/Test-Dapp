import { ethers } from "ethers";
import HellContract from "../HellContract.json";

function loadContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    HellContract.abi,
    signer
  );

  return { provider, signer, contract };
}

export async function testContract() {
  try {
    const { contract } = loadContract();

    const detailsArr = [];
    const personCount = parseInt(await contract.personCount());

    for (let i = 1; i <= personCount; i++) {
      const res = await contract.person(i);
      detailsArr.push({ fname: res[0], lname: res[1] });
    }

    return { detailsArr, personCount };
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

export async function addUser(fname, lname) {
  const { contract } = loadContract();
  try {
    const resp = await contract.addPerson(fname, lname);
    return resp;
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}
