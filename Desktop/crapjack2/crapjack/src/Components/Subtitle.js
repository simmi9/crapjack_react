import styled from "styled-components";

const strokeColor = "#2d9434";

const Subtitle = styled.h1`
  flex: 1;
  font-family: "Rancho", cursive;
  font-size: 2.5rem;
  /* -webkit-text-stroke: 1px #2d9434; */
  color: white;
  text-shadow: 3px 3px 0 ${strokeColor}, -1px -1px 0 ${strokeColor},
    1px -1px 0 ${strokeColor}, -1px 1px 0 ${strokeColor},
    1px 1px 0 ${strokeColor};
  padding: 0;
  margin: 0;
`;

export default Subtitle;