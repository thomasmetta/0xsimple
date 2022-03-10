import { typography } from "../style";
import logoUrl from "../images/logo.svg";
import ipfsLogoUrl from "../images/ipfs.svg";
import polygonLogoUrl from "../images/polygon.svg";
import nftportLogoUrl from "../images/nftportlogo.png";

import { styled } from "../style";

export const Footer = () => {
  return (
    <>
      <Title> Power By </Title>
      <Container>
        <Logo alt="logo" src={logoUrl} />
        <Logo alt="logo" src={ipfsLogoUrl} />
        <Logo alt="logo" src={polygonLogoUrl} />
        <Logo alt="logo" src={nftportLogoUrl} />
      </Container>
    </>
  );
};

const Container = styled("div", {
  display: "flex",
});

const Logo = styled("img", {
  height: "40px",
  marginRight: "20px",
});

const Title = styled("p", typography.b1, {
  color: "$textSecondary",
  marginBottom: "10px",
});
