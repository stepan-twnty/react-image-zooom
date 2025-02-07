import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const Figure = styled.figure`
  position: relative;
  display: inline-block;
  width: auto;
  min-height: 25vh;
  background-position: 50% 50%;
  background-color: #eee;
  margin: 0;
  overflow: hidden;
  cursor: zoom-in;
  img {
    opacity: 0;
    transition: opacity 0s ease-in-out;
  }
  &:before {
    content: "";
    background-color: transparent;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    opacity: 1;
    transition: opacity 0.2s ease-in-out;
    z-index: 1;
  }
  &:after {
    content: "";
    position: absolute;
    top: calc(50% - 25px);
    left: calc(50% - 25px);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 5px solid transparent;
    border-top-color: #333;
    border-right-color: #333;
    border-bottom-color: #333;
    animation: ${rotate} 2s linear infinite;
    opacity: 1;
    transition: opacity 0.2s ease-in-out;
    z-index: 2;
  }
  &.loaded {
    min-height: auto;
    img {
      opacity: 1;
      transition: opacity 0.2s ease-in-out;
    }
    &:before {
      opacity: 0;
    }
    &:after {
      opacity: 0;
    }
  }
`;

const ErrorText = styled.p`
    width: 100%;
    text-align: center;
    border: 1px solid #f8f8f8;
    padding: 8px 16px;
    border-radius: 8px;
    color: #555;
`;

const Img = styled.img`
  transition: opacity 0.8s;
  display: block;
  `;

function ImageZoom({
  zoom = "200",
  alt = "This is an imageZoom image",
  width = "100%",
  height = "auto",
  src,
  id,
  className,
  onError,
  errorContent = <ErrorText>There was a problem loading your image</ErrorText>
}) {
  // define and set default values to the states of the component
  const [zoomed, setZoomed] = useState("1");
  const [position, setPosition] = useState("50% 50%");
  const [imgData, setImgData] = useState(null);
  const [error, setError] = useState(false);
  // convert state data into strings to be used as helper classes
  const figureClass = imgData ? "loaded" : "loading";
  const figureZoomed = zoomed === "0" ? "zoomed" : "fullView";
  const [isOverflowHidden, setIsOverflowHidden] = useState(false);

  const zoomInPosition = (e) => {
    // this will handle the calculations of the area where the image needs to zoom in depending on the user interaction
    const zoomer = e.currentTarget.getBoundingClientRect();
    let x, y;
    if (e.type === 'touchmove') {
      if (!isOverflowHidden) {
        setIsOverflowHidden(true);
        document.body.style.overflow = "hidden";
      }
      const touch = e.touches[0];
      x = ((touch.clientX - zoomer.x) / zoomer.width) * 100;
      y = ((touch.clientY - zoomer.y) / zoomer.height) * 100;
    } else {
      x = ((e.clientX - zoomer.x) / zoomer.width) * 100;
      y = ((e.clientY - zoomer.y) / zoomer.height) * 100;
    }
    setPosition(`${Math.max(0, Math.min(x, 100))}% ${Math.max(0, Math.min(y, 100))}%`);
  }

  const toggleZoomImage = (e) => {
    if (zoomed === "0") {
      // zoom out
      setZoomed("1");
    } else {
      //zoom in and set the background position correctly
      setZoomed("0");
      zoomInPosition(e);
    }
  }

  const handleClick = (e) => {
    // Handle the click events
    toggleZoomImage(e);
  }

  const handleMove = (e) => {
    // Handle the mouse move events
    if (zoomed === "0") {
      zoomInPosition(e);
    }
  }

  const handleLeave = () => {
    // Resets the state of the component on mouse leave
    setZoomed("1");
    setPosition("50% 50%");

    if (isOverflowHidden) {
      setIsOverflowHidden(false);
      document.body.style.overflow = "initial";
    }
  }

  useEffect(() => {
    setImgData(null); // Reset imgData when src changes
    // This checks if the prop src was passed when the component was called and throw an error if this is null or set to empty
    if (src === "" || src === null) {
      throw new Error(
        "Prop src must be defined when using ImageZoom component!"
      );
    }

    // Set initial state on component mount
    setZoomed("0");
    let img = new Image();
    img.addEventListener("load", () => {
      // gracefully disable the loading animation
      setTimeout(() => {
        setZoomed("1");
        setImgData(img.src);
      }, 200);
    });
    img.addEventListener("error", (error) => {
      setError(true);
      onError(error); // call onError if image fails to load
    });
    img.src = src;
  }, [onError, src]);

  if (error) {
    return (
      <>
        {errorContent}
      </>
    )
  } else {
    return (
      <Figure
        id={id}
        className={[figureClass, figureZoomed, className].join(" ")}
        style={{
          backgroundImage: `url( ${zoomed === '0' ? imgData : ''} )`,
          backgroundSize: zoom + "%",
          backgroundPosition: position,
        }}
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onTouchStart={handleClick}
        onTouchMove={handleMove}
        onTouchEnd={handleLeave}
      >
        <Img
          id="imageZoom"
          src={imgData}
          alt={alt}
          style={{ opacity: zoomed }}
          width={width}
          height={height}
        />
      </Figure>
    );
  }

}

export default ImageZoom;