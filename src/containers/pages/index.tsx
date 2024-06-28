import ComicViewer from "index";
import Layout from "components/Layout";
import React, { ChangeEventHandler, useCallback, useState, useRef } from "react";
import Toggle from "react-toggle";
import "react-toggle/style.css";

function Pages(): JSX.Element {
  const [isRightToLeft, setIsRightToLeft] = useState(true);
  const childRef = useRef<any>(null);
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(() => {
    setIsRightToLeft((prevIsRightToLeft) => !prevIsRightToLeft);
    
  }, []);
  return (
    <Layout>
      <div style={{padding: '10px'}} onClick={()=>{childRef?.current?.handleClickOnFullScreen()}}><p>Full Screen CallBack</p></div>
      <ComicViewer
        direction={isRightToLeft ? "rtl" : "ltr"}
        initialCurrentPage={0}
        ref={childRef}
        initialIsExpansion={false}
        onChangeCurrentPage={(currentPage) => {
          console.log(currentPage);
        }}
        onChangeExpansion={(isExpansion) => {
          console.log(isExpansion);
        }}
        onClickCenter={() => {
          console.log("Click the center!");
        }}
        pages={[
          "/comics/0.jpg",
          "/comics/1.jpg",
          "/comics/2.jpg",
          "/comics/3.jpg",
          "/comics/4.jpg",
          "/comics/5.jpg",
          "/comics/6.jpg",
        ]}
        switchingRatio={0.75}
        text={{
          expansion: "拡大",
          fullScreen: "全画面",
          move: "移動",
          normal: "通常",
        }}
      />
      <div style={{ padding: "16px" }}>
        <label style={{ alignItems: "center", display: "inline-flex" }}>
          Direction:
          <Toggle
            defaultChecked={isRightToLeft}
            icons={{
              checked: (
                <div
                  style={{
                    alignItems: "center",
                    color: "#fff",
                    display: "flex",
                    height: "100%",
                  }}
                >
                  rtl
                </div>
              ),
              unchecked: (
                <div
                  style={{
                    alignItems: "center",
                    color: "#fff",
                    display: "flex",
                    height: "100%",
                  }}
                >
                  ltr
                </div>
              ),
            }}
            onChange={handleChange}
          />
        </label>
      </div>
    </Layout>
  );
}

export default Pages;
