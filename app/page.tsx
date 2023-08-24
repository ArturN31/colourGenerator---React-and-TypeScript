'use client';

import React, { useEffect, useState, useRef } from "react";
import { Button, Box, Slider, IconButton, Tooltip } from "@mui/material"; //mui components
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; //mui icon

import {ntc} from '../public/nameThatColour'; //name that colour script 
import SimpleSnackbar from '../components/snackbar'; //Snackbar component

export default function Home() {
  //states
  const [colours, setColours] = useState<Array<any>>([]);
  const [colourNumber, setColourNumber] = useState<number>();
  const [open, setOpen] = useState<boolean>(false);

  //refs
  const sliderRef = useRef(null);
  const snackbarRef = useRef(null);

  //cardrow types
  type CardRowProps = {
    colourHexArray: Array<any>;
  }

  //card props types
  type CardProps = {
    colourHex: string;
    colourName: string | boolean;
    isLocked: boolean;
  }

  //generates colour hex codes and pushes them into an array
  //used to provide content for Cards
  const generateColourHexCode = () => {
    let arr = [];
    let limiter = colourNumber 
                  ? colourNumber - 1 
                  : sliderRef.current !== null 
                    ? sliderRef.current['innerText'] - 1 
                    : 2;

    for (let i = 0; i <= limiter; i++) {
      let hex = "#000000".replace(/0/g, function(){
        return (~~(Math.random()*16)).toString(16).toUpperCase()
      })
      arr.push({
        colourHex: hex,
        colourName: '',
        isLocked: false
      });
    }

    return arr;
  }

  //generates colour hex codes on page load
  //adds an event listener for spacebar press
  useEffect(() => {
    setColours(generateColourHexCode);
    document.addEventListener('keydown', handleSpacebarDetection, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setColours(generateColourHexCode);
  }, [colourNumber])

  const CardRow = ({colourHexArray}: CardRowProps) => {
    //retrieves colour name based on provided hex value - nameThatColour.js
    //used to provide content for Cards
    const getColourName = (hex: string) => {
      let n_match = ntc.name(hex);
      let colour = n_match[1];
      return colour;
    }

    let arr: Array<any> = [];
    colourHexArray.map((colour: any) => {
      arr.push({
        colourHex: colour.colourHex,
        colourName: getColourName(colour['colourHex']),
        isLocked: false
      });
    })

    return (
      <Box className="h-4/5" id="card-row">
        {
          colourHexArray.map((colour: any) => {
            return (<Card 
                    key={colour['colourHex']}
                    colourHex={colour['colourHex']}
                    colourName={getColourName(colour['colourHex'])} 
                    isLocked={false}/>)
          })
        }
      </Box>
    )
  }

  const Card = ({colourHex, colourName}: CardProps) => {
    //handles copying of hex values
    const handleCopy = (colourHex: string) => {
      navigator.clipboard.writeText(colourHex);
    }

    //handles the output of a snackbar popup
    const handleSnackbarPopup = () => {
      if(snackbarRef.current) {
        snackbarRef.current['handleClick()'];
      }
      setOpen(true);
    }

    //handles card text colour based on hex
    const fontColorDynamicStyle = (colourHex: string) => {
      let color = colourHex.substring(1, 7); //getting color without #
      let red = parseInt(color.substring(0,2), 16); //hex to red
      let green = parseInt(color.substring(2,4), 16); //hex to green 
      let blue = parseInt(color.substring(4,6) , 16); //hex to blue
      return (((red * 0.299) + (green * 0.587) + (blue * 0.114)) > 186) ? '#000' : '#fff'; //determines intensity of the background colour and chooses corresponding text colour
    }

    return (
      <Box style={{ backgroundColor: colourHex }}>
        {/* colour information box */}
        <Box className="my-2 select-none w-fit mx-auto" id='card-info'>
          <p style={{color: fontColorDynamicStyle(colourHex)}}>{colourHex}</p> {/* colour hex code output */}
          <p style={{color: fontColorDynamicStyle(colourHex)}}>{colourName}</p> {/* Colour name output */}
          <Box className="grid grid-cols-1 mt-2 w-1/3 mx-auto">
            {/* colour code copy button*/}
            <Tooltip 
            title="Copy colour code" 
            placement="bottom">
              <IconButton
              style={{color: fontColorDynamicStyle(colourHex)}}
              aria-label="Copy colour code"
              onClick={() => {
                handleCopy(colourHex); 
                handleSnackbarPopup();
              }}>
                <ContentCopyIcon/>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    )
  }

  //main output handlers

  //handles the change of displayed colours
  const handleColourChange = () => {
    setColours(generateColourHexCode);
  }

  //handles spacebar press
  const handleSpacebarDetection = (event: any) => {
    if (event.key === ' ') {
      handleColourChange();
      if (sliderRef.current !== null && sliderRef.current['innerText']) setColourNumber(sliderRef.current['innerText']);
    }
  }

  //handles slider text tooltip
  const handleSliderText = (value: number) => {
    return `${value} colours`;
  }

  //handles the slider value change
  const handleColourNumberChange = (event: any) => {
    let value = event.target.value;
    setColourNumber(value);
  }

  return (
    <main className=" h-screen">
      <CardRow colourHexArray={colours}/>

      <Box sx={{ width: 300 }} className="grid content-center mx-auto h-1/5">
        <Slider
        aria-label="Number of colours"
        defaultValue={3}
        getAriaValueText={handleSliderText}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={3}
        max={6}
        onChange={handleColourNumberChange}
        ref={sliderRef}/>

        <Button 
        onClick={handleColourChange}
        className="text-black hover:bg-slate-200 w-full my-2" 
        variant="outlined">
          <span className="text-2xl">New colours</span>
        </Button>
      </Box>

      <SimpleSnackbar open={open} setOpen={setOpen} ref={snackbarRef}/>
    </main>
  )
}