import React, {
  ComponentPropsWithoutRef,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CenterButton,
  CloseButton,
  ControlButton,
  Controller,
  Img,
  ImgProps,
  MainController,
  NavigationButton,
  Page,
  PageProps,
  PagesWrapper,
  PagesWrapperProps,
  RangeInput,
  ScaleController,
  SubController,
  Viewer,
  Wrapper,
  WrapperProps,
} from "./style";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { nanoid } from "nanoid";
import {
  BiChevronLeft,
  BiChevronRight,
  BiCollapse,
  BiExpand,
  BiFullscreen,
  BiMoveHorizontal,
} from "react-icons/bi";
import useOutsideClickRef from "@rooks/use-outside-click-ref";
import { CgClose } from "react-icons/cg";
import { useSwipeable } from "react-swipeable";
import { useWindowSize } from "@react-hook/window-size";
import useDidUpdate from "@rooks/use-did-update";
import screenfull from "screenfull";

export type ClassName =
  | "centerButton"
  | "closeButton"
  | "controller"
  | "expansionControlButton"
  | "fullScreenControlButton"
  | "img"
  | "mainController"
  | "nextNavigationButton"
  | "page"
  | "pagesWrapper"
  | "prevNavigationButton"
  | "rangeInput"
  | "scaleController"
  | "showMoveControlButton"
  | "subController"
  | "viewer"
  | "wrapper";

export type ComicViewerProps = {
  className?: { [key in ClassName]?: string };
  direction?: "ltr" | "rtl";
  initialCurrentPage?: number;
  initialIsExpansion?: boolean;
  onChangeCurrentPage?: (currentPage: number) => void;
  onChangeExpansion?: (isExpansion: boolean) => void;
  onClickCenter?: MouseEventHandler<HTMLAnchorElement>;
  pages: Array<string | ReactNode>;
  switchingRatio?: number;
  text?: Record<"expansion" | "fullScreen" | "move" | "normal", string>;
};

const ComicViewer = React.forwardRef<any, ComicViewerProps>((props, ref: any) : JSX.Element =>{
 let {
    className,
    direction = "rtl",
    initialCurrentPage = 0,
    initialIsExpansion = false,
    onChangeCurrentPage,
    onChangeExpansion,
    onClickCenter,
    pages: pagesProp,
    switchingRatio = 1,
    text = {
      expansion: "Expansion",
      fullScreen: "Full screen",
      move: "Move",
      normal: "Normal",
    },
  }= props
  const isRightToLeft = useMemo(() => direction === "rtl", [direction]);
  const {
    expansion: expansionText,
    fullScreen,
    move,
    normal,
  } = useMemo(() => text, [text]);
  const [width, height] = useWindowSize();
  const [isExpansion, setIsExpansion] =
    useState<WrapperProps["isExpansion"]>(initialIsExpansion);
  const [switchingFullScreen, setSwitchingFullScreen] =
    useState<PagesWrapperProps["switchingFullScreen"]>(false);
  const handle = useFullScreenHandle();
  const { active, enter, exit } = useMemo(() => handle, [handle]);
  const handleClickOnExpansion = useCallback<
    NonNullable<ComponentPropsWithoutRef<"button">["onClick"]>
  >(() => {
    setIsExpansion((prevIsExpansion) => !prevIsExpansion);
  }, []);
  const handleClickOnFullScreen = useCallback<
    NonNullable<ComponentPropsWithoutRef<"button">["onClick"]>
  >(() => {
    setSwitchingFullScreen(true);

    enter();
  }, [enter]);
  const handleClickOnClose = useCallback<
    NonNullable<ComponentPropsWithoutRef<"button">["onClick"]>
  >(() => {
    setSwitchingFullScreen(true);

    exit();
  }, [exit]);
  const pageWidth = useMemo<PageProps["width"]>(
    () => (height > width * switchingRatio ? width : width / 2),
    [switchingRatio, height, width]
  );
  const expansion = useMemo<ComponentPropsWithoutRef<"button">["children"]>(
    () => (isExpansion ? normal : expansionText),
    [expansionText, isExpansion, normal]
  );
  const expansionIcon = useMemo(
    () =>
      isExpansion ? (
        <BiCollapse color="#fff" size={24} />
      ) : (
        <BiExpand color="#fff" size={24} />
      ),
    [isExpansion]
  );
  const isSingleView = useMemo<ImgProps["isSingleView"]>(
    () => height > width * switchingRatio,
    [switchingRatio, height, width]
  );
  const pages = useMemo(() => {
    if (isRightToLeft) {
      return pagesProp;
    }

    const reversePages = pagesProp.slice().reverse();

    if (isSingleView || reversePages.length % 2 === 0) {
      return reversePages;
    }

    return [null, ...reversePages];
  }, [isRightToLeft, isSingleView, pagesProp]);
  const items = useMemo(
    () =>
      pages.map((page, index) => (
        <Page className={className?.page} key={nanoid()} width={pageWidth}>
          {typeof page === "string" ? (
            <Img
              alt={page}
              className={className?.img}
              isOdd={!(index % 2)}
              isSingleView={isSingleView}
              src={page}
            />
          ) : (
            page
          )}
        </Page>
      )),
    [className?.img, className?.page, isSingleView, pageWidth, pages]
  );
  const [prevIsExpansion, setPrevIsExpansion] = useState<
    typeof isExpansion | undefined
  >();
  const [currentPage, setCurrentPage] = useState(
    isSingleView ? initialCurrentPage : Math.floor(initialCurrentPage / 2) * 2
  );
  const disabledNextPage = useMemo(
    () =>
      (isSingleView && currentPage >= pages.length - 1) ||
      (!isSingleView && currentPage >= pages.length - 2),
    [currentPage, isSingleView, pages.length]
  );
  const handleClickOnNextPage = useCallback<
    NonNullable<ComponentPropsWithoutRef<"a">["onClick"]>
  >(() => {
    if (disabledNextPage) {
      return;
    }

    setSwitchingFullScreen(false);
    setCurrentPage(
      (prevCurrentPage) => prevCurrentPage + (isSingleView ? 1 : 2)
    );
  }, [disabledNextPage, isSingleView]);
  const disabledPrevPage = useMemo(() => currentPage === 0, [currentPage]);
  const handleClickOnPrevPage = useCallback<
    NonNullable<ComponentPropsWithoutRef<"a">["onClick"]>
  >(() => {
    if (disabledPrevPage) {
      return;
    }

    setSwitchingFullScreen(false);
    setCurrentPage(
      (prevCurrentPage) => prevCurrentPage - (isSingleView ? 1 : 2)
    );
  }, [disabledPrevPage, isSingleView]);
  const [showMove, setShowMove] = useState(false);
  const handleClickOnShowMove = useCallback<
    NonNullable<ComponentPropsWithoutRef<"button">["onClick"]>
  >(() => {
    setShowMove(true);
  }, []);
  const handleChange = useCallback<
    NonNullable<ComponentPropsWithoutRef<"input">["onChange"]>
  >(
    ({ currentTarget: { value } }) => {
      setSwitchingFullScreen(false);
      setCurrentPage(
        isSingleView ? parseInt(value, 10) - 1 : (parseInt(value, 10) - 1) * 2
      );
    },
    [isSingleView]
  );
  const handleClickOnOutside = useCallback(() => {
    setShowMove(false);
  }, []);
  const [refSubController] = useOutsideClickRef(handleClickOnOutside);
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (isRightToLeft) {
        // keep current old logic
        if (disabledPrevPage) {
          return;
        }
  
        setSwitchingFullScreen(false);
        setCurrentPage(
          (prevCurrentPage) => prevCurrentPage - (isSingleView ? 1 : 2)
        );
      } else {
        // english (ltr) logic
        setSwitchingFullScreen(false);
        setCurrentPage(
          (prevCurrentPage) => prevCurrentPage + (isSingleView ? 1 : 2) <= pages.length -1 ? prevCurrentPage + (isSingleView ? 1 : 2): prevCurrentPage
        );
      }
     
    },
    onSwipedRight: () => {
    
      if (isRightToLeft) {
        // keep current old logic
        if (disabledNextPage) {
          return;
        }
        setSwitchingFullScreen(false);
        setCurrentPage(
          (prevCurrentPage) => prevCurrentPage + (isSingleView ? 1 : 2)
        );
      } else {
        // english (ltr) logic
        setSwitchingFullScreen(false);
        setCurrentPage(
          (prevCurrentPage) => prevCurrentPage - (isSingleView ? 1 : 2) >= 0 ? prevCurrentPage - (isSingleView ? 1 : 2): prevCurrentPage
        );
      }
     
    },
  });
  const { isEnabled } = useMemo(() => screenfull, []);
  const rangeMax = useMemo(
    () => (isSingleView ? pages.length : Math.ceil(pages.length / 2)),
    [isSingleView, pages.length]
  );
  const rangeValue = useMemo(
    () => (isSingleView ? currentPage + 1 : Math.floor(currentPage / 2) + 1),
    [currentPage, isSingleView]
  );

  useEffect(() => {
    if (!active) {
      if (typeof prevIsExpansion !== "boolean") {
        return;
      }

      setPrevIsExpansion(undefined);
      setIsExpansion(prevIsExpansion);

      return;
    }

    if (typeof prevIsExpansion === "boolean") {
      return;
    }

    setPrevIsExpansion(isExpansion);
    setIsExpansion(true);
  }, [active, isExpansion, prevIsExpansion]);

  useDidUpdate(() => {
    if (isSingleView) {
      return;
    }

    setCurrentPage((prevCurrentPage) => Math.floor(prevCurrentPage / 2) * 2);
  }, [isSingleView]);

  useDidUpdate(() => {
    if (!onChangeCurrentPage) {
      return;
    }

    onChangeCurrentPage(currentPage);
  }, [currentPage, onChangeCurrentPage]);

  useDidUpdate(() => {
    if (!onChangeExpansion) {
      return;
    }

    onChangeExpansion(isExpansion);
  }, [isExpansion, onChangeExpansion]);

  React.useImperativeHandle(ref, () => {
    return {
      handleChange: handleChange,
      handleClickOnExpansion: handleClickOnExpansion,
      handleClickOnFullScreen: handleClickOnFullScreen,
      handleClickOnShowMove: handleClickOnShowMove,
    }
  });

  return (
    <FullScreen handle={handle}>
      <Wrapper
        className={className?.wrapper}
        height={height}
        isExpansion={isExpansion}
        isFullScreen={active}
        {...handlers}
      >
        <Viewer className={className?.viewer}>
          <PagesWrapper
            className={className?.pagesWrapper}
            currentPage={currentPage}
            direction={direction}
            isSingleView={isSingleView}
            pagesLength={pages.length}
            pageWidth={pageWidth}
            switchingFullScreen={switchingFullScreen}
          >
            {items}
          </PagesWrapper>
          {disabledNextPage ? null : (
            <NavigationButton
              className={className?.nextNavigationButton}
              direction={direction}
              navigation="next"
              onClick={handleClickOnNextPage}
            >
              {isRightToLeft ? (
                <BiChevronLeft color="#888" size={64} />
              ) : (
                <BiChevronRight color="#888" size={64} />
              )}
            </NavigationButton>
          )}
          {onClickCenter ? (
            <CenterButton
              className={className?.centerButton}
              onClick={onClickCenter}
            />
          ) : null}
          {disabledPrevPage ? null : (
            <NavigationButton
              className={className?.prevNavigationButton}
              direction={direction}
              navigation="prev"
              onClick={handleClickOnPrevPage}
            >
              {isRightToLeft ? (
                <BiChevronRight color="#888" size={64} />
              ) : (
                <BiChevronLeft color="#888" size={64} />
              )}
            </NavigationButton>
          )}
        </Viewer>
        {active ? (
          <CloseButton
            className={className?.closeButton}
            onClick={handleClickOnClose}
          >
            <CgClose color="#fff" size={36} />
          </CloseButton>
        ) : (
          <Controller className={className?.controller}>
            {showMove ? (
              <SubController className={className?.subController} ref={refSubController}>
                <RangeInput
                  className={className?.rangeInput}
                  direction={direction}
                  onChange={handleChange}
                  max={rangeMax}
                  min={1}
                  step={1}
                  type="range"
                  value={rangeValue}
                />
              </SubController>
            ) : (
              <MainController className={className?.mainController}>
                <ScaleController className={className?.scaleController}>
                  <ControlButton
                    className={className?.expansionControlButton}
                    onClick={handleClickOnExpansion}
                  >
                    {expansionIcon}
                    {expansion}
                  </ControlButton>
                  {isEnabled ? (
                    <ControlButton
                      className={className?.fullScreenControlButton}
                      onClick={handleClickOnFullScreen}
                    >
                      <BiFullscreen color="#fff" size={24} />
                      {fullScreen}
                    </ControlButton>
                  ) : null}
                </ScaleController>
                <ControlButton
                  className={className?.showMoveControlButton}
                  onClick={handleClickOnShowMove}
                >
                  <BiMoveHorizontal color="#fff" size={24} />
                  {move}
                </ControlButton>
              </MainController>
            )}
          </Controller>
        )}
      </Wrapper>
    </FullScreen>
  );
}
)



const NoSSRComicViewer = React.forwardRef<any,ComicViewerProps>((props, ref) : JSX.Element | null => {
  return typeof window !== "undefined" ? <ComicViewer {...props} ref={ref} /> : null;
});

export default NoSSRComicViewer;


// function NoSSRComicViewer(props: ComicViewerProps): JSX.Element | null {
//   return typeof window !== "undefined" ? <ComicViewer {...props} /> : null;
// }
// export default NoSSRComicViewer;