import { Link } from "react-router-dom";
import { Button } from "./components/Button";
import { Footer } from "./components/Footer";
import { typography } from "./style";

import { styled } from "./style";

export const Home = () => {
  return (
    <Container>
      <CTA>Simplest way to build on metaverse</CTA>
      <Title>I am a</Title>
      <Selection>
        <SubSelection>
          <Title>Gaming studio</Title>
          <Description>
            You can now create NFT asset for free with no gas fees.
          </Description>
          <Description>Login with Social/email login</Description>
          <Description>
            Your created asset will be stored in non-custodial
          </Description>
          <Link to="/admin">
            <Button>Start building</Button>
          </Link>
        </SubSelection>
        <SubSelection>
          <Title>Gamer</Title>
          <Description>Claiming free in game loot with no gas fee</Description>
          <Description>Login with Social/email login</Description>
          <Description>Transfer out your claimed asset for free</Description>
          <Link to="/claim">
            <Button>Claim for free</Button>
          </Link>
        </SubSelection>
      </Selection>
      <CTA>Takes complexity out of building on metaverse</CTA>
      <Description>So everyone can focus on what they do best.</Description>
      <Footer />
    </Container>
  );
};

const Title = styled("h1", typography.h1, {
  color: "$textPrimary",
  fontSize: "25px",
});

const Container = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
});

const Description = styled("p", typography.b1, {
  color: "$textSecondary",
  marginBottom: "15px",
});

const CTA = styled("h1", typography.b1, {
  color: "$textPrimary",
  fontSize: 50,
});

const SubSelection = styled("div", typography.h1, {
  paddingRight: 100,
  paddingLeft: 100,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
});

const Selection = styled("div", {
  display: "flex",
  justifyContent: "space-around",
  padding: 10,
});
