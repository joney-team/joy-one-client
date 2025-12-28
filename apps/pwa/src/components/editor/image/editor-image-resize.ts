import Image from "@tiptap/extension-image";

export const ImageResize = Image.extend({
  addAttributes() {
    return {
      // @ts-ignore
      ...this.parent?.(),
      style: {
        default: "width: 100%; height: auto; cursor: pointer;",
        parseHTML: (element: HTMLElement) => {
          const width = element.getAttribute("width");
          return width
            ? `width: ${width}px; height: auto; cursor: pointer;`
            : `${element.style.cssText}`;
        },
      },
    };
  },
  addNodeView() {
    // @ts-ignore
    return ({ node, editor, ...rest }) => {
      const {
        view,
        options: { editable },
      } = editor;

      const { style } = node.attrs;
      const $wrapper = document.createElement("div");
      const $container = document.createElement("div");
      const $img = document.createElement("img");
      const iconStyle =
        "width: 24px; height: 24px; cursor: pointer; margin-bottom: 0px !important;";

      const dispatchNodeView = () => {
        if (rest.getPos && typeof rest.getPos === "function") {
          const newAttrs = {
            ...node.attrs,
            style: `${$img.style.cssText}`,
          };
          view.dispatch(view.state.tr.setNodeMarkup(rest.getPos()!, null, newAttrs));
        }
      };
      const paintPositionContoller = () => {
        const $postionController = document.createElement("div");

        const $leftController = document.createElement("img");
        const $centerController = document.createElement("img");
        const $rightController = document.createElement("img");

        const controllerMouseOver = (e: any) => {
          e.target.style.opacity = 0.8;
        };

        const controllerMouseOut = (e: any) => {
          e.target.style.opacity = 1;
        };

        $postionController.setAttribute(
          "style",
          "position: absolute; top: 0%; left: 50%; width: 120px; height: 28px; z-index: 100; background-color: rgba(255, 255, 255, 0.7); border-radius: 4px; border: 2px solid #0000002e; cursor: pointer; transform: translate(-50%, -50%); display: flex; justify-content: space-around; align-items: center;"
        );

        $leftController.setAttribute(
          "src",
          "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_left/default/20px.svg"
        );
        $leftController.setAttribute("style", iconStyle);
        $leftController.addEventListener("mouseover", controllerMouseOver);
        $leftController.addEventListener("mouseout", controllerMouseOut);

        $centerController.setAttribute(
          "src",
          "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_center/default/20px.svg"
        );
        $centerController.setAttribute("style", iconStyle);
        $centerController.addEventListener("mouseover", controllerMouseOver);
        $centerController.addEventListener("mouseout", controllerMouseOut);

        $rightController.setAttribute(
          "src",
          "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_right/default/20px.svg"
        );
        $rightController.setAttribute("style", iconStyle);
        $rightController.addEventListener("mouseover", controllerMouseOver);
        $rightController.addEventListener("mouseout", controllerMouseOut);

        $leftController.addEventListener("click", () => {
          $img.setAttribute("style", `${$img.style.cssText} margin: 0 auto 0 0;`);
          dispatchNodeView();
        });
        $centerController.addEventListener("click", () => {
          $img.setAttribute("style", `${$img.style.cssText} margin: 0 auto;`);
          dispatchNodeView();
        });
        $rightController.addEventListener("click", () => {
          $img.setAttribute("style", `${$img.style.cssText} margin: 0 0 0 auto;`);
          dispatchNodeView();
        });

        $postionController.appendChild($leftController);
        $postionController.appendChild($centerController);
        $postionController.appendChild($rightController);

        const $openGalleryController = document.createElement("img");
        $openGalleryController.setAttribute(
          "src",
          "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/visibility/default/20px.svg"
        );
        $openGalleryController.setAttribute("style", iconStyle);
        $openGalleryController.addEventListener("mouseover", controllerMouseOver);
        $openGalleryController.addEventListener("mouseout", controllerMouseOut);

        $openGalleryController.addEventListener("click", () => {
          // TODO: Implement image gallery
        });

        $postionController.appendChild($openGalleryController);

        $container.appendChild($postionController);
      };

      $wrapper.setAttribute("style", `display: flex;`);
      $wrapper.appendChild($container);

      $container.setAttribute("style", `${style}`);
      $container.appendChild($img);

      Object.entries(node.attrs).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        $img.setAttribute(key, value as string);
      });

      if (!editable) return { dom: $container };
      const isMobile = document.documentElement.clientWidth < 768;
      const dotPosition = isMobile ? "-8px" : "-4px";
      const dotsPosition = [
        `top: ${dotPosition}; left: ${dotPosition}; cursor: nwse-resize;`,
        `top: ${dotPosition}; right: ${dotPosition}; cursor: nesw-resize;`,
        `bottom: ${dotPosition}; left: ${dotPosition}; cursor: nesw-resize;`,
        `bottom: ${dotPosition}; right: ${dotPosition}; cursor: nwse-resize;`,
      ];

      let isResizing = false;
      let startX: number, startWidth: number;

      $container.addEventListener("click", (e) => {
        //remove remaining dots and position controller
        const isMobile = document.documentElement.clientWidth < 768;
        isMobile && (document.querySelector(".ProseMirror-focused") as HTMLElement)?.blur();

        if ($container.childElementCount > 3) {
          for (let i = 0; i < 5; i++) {
            $container.removeChild($container.lastChild as Node);
          }
        }

        paintPositionContoller();

        $container.setAttribute(
          "style",
          `position: relative; border: 1px dashed #6C6C6C; ${style} cursor: pointer;`
        );

        Array.from({ length: 4 }, (_, index) => {
          const $dot = document.createElement("div");
          $dot.setAttribute(
            "style",
            `position: absolute; width: ${isMobile ? 16 : 9}px; height: ${
              isMobile ? 16 : 9
            }px; border: 1.5px solid #6C6C6C; border-radius: 50%; ${dotsPosition[index]}`
          );

          $dot.addEventListener("mousedown", (e) => {
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startWidth = $container.offsetWidth;

            const onMouseMove = (e: MouseEvent) => {
              if (!isResizing) return;
              const deltaX = index % 2 === 0 ? -(e.clientX - startX) : e.clientX - startX;

              const newWidth = startWidth + deltaX;

              $container.style.width = newWidth + "px";

              $img.style.width = newWidth + "px";
            };

            const onMouseUp = () => {
              if (isResizing) {
                isResizing = false;
              }
              dispatchNodeView();

              document.removeEventListener("mousemove", onMouseMove);
              document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
          });

          $dot.addEventListener(
            "touchstart",
            (e) => {
              e.cancelable && e.preventDefault();
              isResizing = true;
              startX = e.touches[0].clientX;
              startWidth = $container.offsetWidth;

              const onTouchMove = (e: TouchEvent) => {
                if (!isResizing) return;
                const deltaX =
                  index % 2 === 0
                    ? -(e.touches[0].clientX - startX)
                    : e.touches[0].clientX - startX;

                const newWidth = startWidth + deltaX;

                $container.style.width = newWidth + "px";

                $img.style.width = newWidth + "px";
              };

              const onTouchEnd = () => {
                if (isResizing) {
                  isResizing = false;
                }
                dispatchNodeView();

                document.removeEventListener("touchmove", onTouchMove);
                document.removeEventListener("touchend", onTouchEnd);
              };

              document.addEventListener("touchmove", onTouchMove);
              document.addEventListener("touchend", onTouchEnd);
            },
            { passive: false }
          );
          $container.appendChild($dot);
        });
      });

      document.addEventListener("click", (e: MouseEvent) => {
        const $target = e.target as HTMLElement;
        const isClickInside = $container.contains($target) || $target.style.cssText === iconStyle;

        if (!isClickInside) {
          const containerStyle = $container.getAttribute("style");
          const newStyle = containerStyle?.replace("border: 1px dashed #6C6C6C;", "");
          $container.setAttribute("style", newStyle as string);

          if ($container.childElementCount > 3) {
            for (let i = 0; i < 5; i++) {
              $container.removeChild($container.lastChild as Node);
            }
          }
        }
      });

      return {
        dom: $wrapper,
      };
    };
  },
});
