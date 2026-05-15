"use client";

import { App, ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";

export function AntProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorBgBase: "#f5f7ff",
          colorBgContainer: "#fbfcff",
          colorBgElevated: "#ffffff",
          colorFillAlter: "#f1f4ff",
          colorTextBase: "#151936",
          colorPrimary: "#3448f4",
          colorPrimaryHover: "#4f6fff",
          colorPrimaryActive: "#2636c8",
          colorSuccess: "#217f61",
          colorWarning: "#b66a17",
          colorError: "#c2413a",
          colorInfo: "#4169f6",
          colorBorder: "#dbe1f2",
          colorBorderSecondary: "#e8ecf8",
          colorTextSecondary: "#67708f",
          controlHeight: 36,
          controlHeightSM: 30,
          controlHeightLG: 42,
          borderRadius: 8,
          borderRadiusSM: 6,
          borderRadiusLG: 8,
          boxShadowSecondary:
            "0 1px 1px rgba(21, 25, 54, 0.04), 0 12px 30px rgba(52, 72, 244, 0.08)",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        },
        components: {
          Layout: {
            bodyBg: "#f5f7ff",
            headerBg: "#fbfcff",
            siderBg: "#eef3ff",
          },
          Card: {
            headerBg: "transparent",
            borderRadiusLG: 8,
            headerFontSize: 14,
            headerHeight: 52,
            headerPadding: 18,
            bodyPadding: 18,
            extraColor: "#67708f",
          },
          Button: {
            fontWeight: 680,
            defaultBg: "#ffffff",
            defaultColor: "#252b54",
            defaultBorderColor: "#c8d1ec",
            defaultHoverBg: "#f1f4ff",
            defaultHoverColor: "#2636c8",
            defaultHoverBorderColor: "#3448f4",
            defaultActiveBg: "#e7ecff",
            defaultActiveColor: "#2636c8",
            defaultActiveBorderColor: "#2636c8",
            defaultShadow: "none",
            primaryColor: "#ffffff",
            primaryShadow: "0 8px 18px rgba(52, 72, 244, 0.2)",
            dangerShadow: "none",
            paddingInline: 15,
            paddingInlineSM: 12,
            paddingInlineLG: 18,
          },
          Menu: {
            itemBg: "transparent",
            itemColor: "#4b5579",
            itemHoverBg: "#e7ecff",
            itemHoverColor: "#2636c8",
            itemSelectedBg: "#dde5ff",
            itemSelectedColor: "#2636c8",
          },
          Table: {
            headerBg: "#f1f4ff",
            headerColor: "#3f496f",
            headerBorderRadius: 8,
            rowHoverBg: "#f4f6ff",
            rowSelectedBg: "#e9eeff",
            rowSelectedHoverBg: "#e2e8ff",
            borderColor: "#e5e9f7",
            cellPaddingBlockSM: 10,
            cellPaddingInlineSM: 12,
            cellFontSizeSM: 13,
          },
          Tabs: {
            inkBarColor: "#3448f4",
            itemColor: "#67708f",
            itemHoverColor: "#2636c8",
            itemActiveColor: "#2636c8",
            itemSelectedColor: "#2636c8",
            titleFontSize: 14,
            horizontalItemPadding: "10px 0 12px",
          },
          Select: {
            selectorBg: "#ffffff",
            optionSelectedBg: "#e9eeff",
            optionActiveBg: "#f4f6ff",
            optionSelectedColor: "#2636c8",
            hoverBorderColor: "#3448f4",
            activeBorderColor: "#3448f4",
            activeOutlineColor: "rgba(52, 72, 244, 0.12)",
          },
          Tag: {
            defaultBg: "#f1f4ff",
            defaultColor: "#3f496f",
          },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
