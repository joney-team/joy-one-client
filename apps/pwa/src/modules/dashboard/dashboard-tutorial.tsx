"use client";

import { Button } from "@/components/buttons/button";
import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Stack, Text } from "@mantine/core";
import { FC, Fragment, useEffect, useState } from "react";
import Tour from "reactour";

export const DashboardTutorial: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const viewport = useLayout();
  const workspace = useWorkspace();
  const color = useColor();

  useEffect(() => {
    const readed = !!localStorage.getItem("tutorials-dashboard");
    if (!readed) {
      setIsVisible(true);
    }
  }, []);

  const onDone = () => {
    localStorage.setItem("tutorials-dashboard", "readed");
    setIsVisible(false);
  };

  return (
    <Tour
      accentColor={color("primary")}
      steps={
        viewport.view === "mobile"
          ? [
              {
                selector: "#create-customer",
                content: "Tạo khách hàng mới",
              },
              {
                selector: "#create-ticket",
                content: (
                  <Text>
                    Tạo phiếu thu <strong>#Ticket</strong>
                  </Text>
                ),
              },
              {
                selector: "#search-bar",
                content: "Tìm kiếm mọi thứ trong ứng dụng",
              },
              {
                selector: "#user-notifications",
                content: "Thông báo từ hệ thống",
              },
              {
                selector: "#app-account",
                content: "Thông tin cá nhân & nhiều cài đặt khác",
              },
              {
                selector: "#dashboard-report",
                content: "Báo cáo doanh thu, khách hàng mới, bookings đã hoàn thành trong ngày",
              },
              {
                selector: "#nav-route-tasks",
                content: (
                  <Text>
                    <strong>#Tasks</strong> Danh sách công việc cần làm hoặc giao việc cho nhân sự
                  </Text>
                ),
              },
              {
                selector: "#nav-route-customers",
                content: "Danh sách khách hàng",
              },
              {
                selector: "#nav-route-bookings",
                content: (
                  <Text>
                    Danh sách lịch hẹn <strong>#Bookings</strong> của khách hàng
                  </Text>
                ),
              },
              {
                selector: "#nav-other-routes",
                content: (
                  <Stack>
                    <Text>• Thiết lập ngân hàng nhận tiền</Text>
                    <Text>
                      • Phiếu thu <strong>#Tickets</strong>
                    </Text>
                    <Text>• Hoá đơn</Text>
                    <Text>• Quản lí Sản phẩm / Dịch vụ</Text>
                    <Text>• Kiểm kho</Text>
                    <Text>• Báo cáo kết quả kinh doanh</Text>
                    <Text mt={10}>Và nhiều tính năng khác ...</Text>
                    <Button onClick={onDone}>Bắt đầu sử dụng</Button>
                  </Stack>
                ),
              },
            ]
          : [
              {
                selector: "#search-bar",
                content: "Tìm kiếm mọi thứ trong ứng dụng",
              },
              {
                selector: "#user-notifications",
                content: "Thông báo từ hệ thống",
              },
              {
                selector: "#create-ticket",
                content: (
                  <Text>
                    Tạo phiếu thu <strong>#Ticket</strong>
                  </Text>
                ),
              },
              {
                selector: "#create-customer",
                content: "Tạo khách hàng mới",
              },
              {
                selector: "#dashboard-report",
                content: "Báo cáo doanh thu, khách hàng mới, bookings đã hoàn thành trong ngày",
              },
              {
                selector: "#dashboard-bookings",
                content: (
                  <Text>
                    Hiển thị lịch hẹn <strong>#Bookings</strong> hôm nay, có thể lọc theo trạng thái
                    đang xử lí hoặc tất cả
                  </Text>
                ),
              },
              {
                selector: "#app-account",
                content: (
                  <Stack>
                    <Text>Thông tin cá nhân & nhiều cài đặt khác</Text>
                  </Stack>
                ),
              },
              {
                selector: "#app-navigation",
                content: (
                  <Stack>
                    <Text>
                      <strong>#Tasks</strong> Danh sách công việc cần làm hoặc giao việc cho nhân sự
                    </Text>
                    <Text>
                      <strong>#Khách hàng</strong> Danh sách khách hàng của bạn
                    </Text>
                    <Text>
                      <strong>#Bookings</strong> lịch đặt hẹn của khách hàng
                    </Text>
                    <Text>
                      <strong>#Tickets</strong> phiếu thu
                    </Text>
                    <Text>
                      <strong>#Hoá đơn</strong> được tạo khi thu phí
                    </Text>
                    <Text>
                      <strong>#Sản phẩm</strong> quản lí sản phẩm và Kiểm kho
                    </Text>
                    <Text>
                      <strong>#Dịch vụ</strong> quản lí dịch vụ cung cấp
                    </Text>

                    {workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS) && (
                      <Fragment>
                        <Text>
                          <strong>#Ngân hàng</strong> thiết lập tài khoản ngân hàng nhận tiền thanh
                          toán
                        </Text>
                        <Text>
                          <strong>#Zalo OA</strong> thiết lập kết nối với Zalo Official Accounts
                          (Liên hệ đội ngũ Support)
                        </Text>
                        <Text>
                          <strong>#Hệ thống Mail</strong> Tuỳ biến địa chỉ gửi mail
                        </Text>
                      </Fragment>
                    )}

                    <Button onClick={onDone}>Bắt đầu sử dụng</Button>
                  </Stack>
                ),
              },
            ]
      }
      isOpen={isVisible}
      onRequestClose={onDone}
      disableDotsNavigation={true}
      showNavigation={false}
      closeWithMask={false}
      rounded={8}
    />
  );
};
