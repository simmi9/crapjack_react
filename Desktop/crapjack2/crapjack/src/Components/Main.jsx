import React from "react";
import styled from "styled-components";
import Nav from "./Nav";
import Button from "./Button";  
import Title from "./Title";
import Subtitle from "./Subtitle";

const MainContainer = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
  background-color: #4caf50;  
`;

const Main = () => {
  return (
    <MainContainer>
      <Nav>
        <Title>The Concentration Game</Title>
        <Subtitle>matchCount</Subtitle>
        <Subtitle>failCount</Subtitle>
        <Button >New Game</Button>
      </Nav>
    </MainContainer>
  );
};

export default Main;