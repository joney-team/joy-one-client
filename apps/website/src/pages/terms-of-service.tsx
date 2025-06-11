import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Box, Container, Stack, Text, Title, em } from '@mantine/core';
import { NextPage } from 'next';

const Page: NextPage = () => {
  return (
    <>
      <Box
        style={{ maxWidth: '100%', overflowX: 'hidden' }}
      >
        <Box style={{ backgroundImage: `url(/images/bg.png)`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}>
          <Container size="lg" py={20} pb={100}>
            <Stack>
              <Header />

              <Title py={40} fz={em(30)} c="primary" ta="center">Điều khoản sử dụng JoyOne.vn</Title>

              <Text>
                Những điều khoản được áp dụng cho Người dùng, Affiliate và Agency (đại lý) của JoyOne. Bạn vui lòng đọc kỹ toàn bộ thỏa thuận trước khi tham gia. Một khi bạn đã đăng ký tham gia joyone.vn, chúng tôi sẽ hiểu rằng bạn đã đọc và đồng ý toàn bộ điều khoản được đưa ra trong bản thỏa thuận này.
                <br />
                Bản cập nhật mới nhất sẽ được đăng tại đây và sẽ không thông báo đến từng đối tác. Bạn hãy quay lại trang này để cập nhật chính sách mới. Để được sử dụng các dịch vụ của JoyOne, bạn cần tuân thủ các điều khoản sau:
              </Text>

              <Title order={3}>
                1. Định nghĩa
              </Title>

              <ul>
                <li>
                  <strong>JoyOne:</strong> Phần mềm quản lý doanh nghiệp trên nền tảng web và ứng dụng di động của JoyOne
                </li>

                <li>
                  <strong>Người dùng:</strong> Là người đăng ký, tạo tài khoản, sử dụng phần mềm của JoyOne
                </li>

                <li>
                  <strong>Bên thứ ba:</strong> Khách hàng, đối tác, nhà cung cấp của doanh nghiệp của Người dùng.
                </li>

                <li>
                  <strong>Dữ liệu doanh nghiệp:</strong> Dữ liệu dưới dạng điện tử được lưu trữ trên doanh nghiệp (workspace): khách hàng, hội thoại, đơn hàng,..
                </li>

                <li>
                  <strong>Tính năng:</strong> Tính năng hiện có và đang được cung cấp trên JoyOne.
                </li>
              </ul>

              <Title order={3}>
                2. Khởi tạo dịch vụ
              </Title>

              <Text>Để sử dụng JoyOne, người dùng hàng phải đăng ký tài khoản và cung cấp các thông tin liên hệ, tạo cửa hàng (shop), kết nối fanpage, website hoặc các kênh bán hàng cần tích hợp JoyOne.</Text>
              <Text>JoyOne cam kết không chia sẻ dữ liệu cửa hàng cho bất kỳ bên thứ 3 nào. Ngoài ra, chúng tôi đảm bảo thực hiện các hoạt động chăm sóc, giải quyết các khiếu nại, tranh chấp và hỗ trợ trong suốt quá trình Người dùng sử dụng JoyOne.</Text>

              <Title order={3}>
                3. Miễn trừ trách nhiệm
              </Title>

              <Text>JoyOne chỉ cung cấp phần mềm, nên chúng tôi không can thiệp và không chịu trách nhiệm:</Text>

              <ul>
                <li>Khách hàng của Người dùng JoyOne</li>
                <li>Tin nhắn, hội thoại, đơn hàng, sản phẩm mà Người dùng đang kinh doanh.</li>
              </ul>

              <Text>
                Đồng thời JoyOne cũng không chịu trách nhiệm đối với các khiếu kiện từ Bên thứ ba về hoạt động của Người dùng. JoyOne có toàn quyền tạm ngưng cung cấp hoặc ngăn chặn quyền tiếp tục truy cập phần mềm của người dùng khi có căn cứ hoặc có dấu hiệu nghi ngờ vi phạm pháp luật, có báo cáo, khiếu nại từ Bên thứ ba gửi về JoyOne.
              </Text>

              <Text>
                Để tiếp tục sử dịch vụ, JoyOne có quyền yêu cầu người dùng cung cấp thông tin để xác minh và/hoặc thực hiện cam kết để có thể tiếp tục sử dụng dịch vụ. Trường hợp nhận thấy sự việc có tính chất nghiêm trọng, JoyOne có toàn quyền nhờ đến sự can thiệp của các cơ quan nhà nước có thẩm quyền, các đơn vị có chức năng chuyên môn để đảm bảo quyền và lợi ích hợp pháp cho JoyOne cũng như cộng đồng.
              </Text>

              <Title order={3}>
                4. Tạm ngừng cung cấp dịch vụ
              </Title>

              <Text>JoyOne có quyền tạm ngừng cung cấp dịch vụ mà không phải hoàn lại bất kỳ một chi phí nào trong các trường hợp sau:</Text>

              <ul>
                <li>
                  Người dùng sử dụng JoyOne để phá hoại một hoặc một số website khác.
                </li>

                <li>
                  Người dùng sử dụng JoyOne vào mục đích/hình thức nào vi phạm pháp luật Việt Nam, đặc biệt về vấn đề bản quyền.
                </li>

                <li>
                  Sử dụng bất kỳ phần mềm, công cụ hay hình thức nào để can thiệp vào các dịch vụ trong hệ thống JoyOne.
                </li>

                <li>
                  Phát tán hoặc tuyên truyền cổ vũ các hoạt động phát tán, can thiệp và phá hoại hệ thống của JoyOne. Mọi vi phạm khi bị phát hiện sẽ bị xóa tài khoản và có thể xử lý theo quy định của pháp luật.
                </li>

                <li>
                  Mạo danh JoyOne, mạo danh thương hiệu làm ảnh hưởng đến uy tín của JoyOne, gây sự nhầm lẫn cho các khách hàng, Affiliate và Nhà cung cấp theo bất kỳ phương thức nào (dùng địa chỉ email, tên miền website, fanpage có chữ JoyOne,..)
                </li>
              </ul>

              <Text>Khi phát hiện những hành vi trên từ tài khoản của bạn, JoyOne có quyền tước bỏ mọi quyền lợi liên quan đối với tài khoản (bao gồm việc khóa tài khoản) hoặc sử dụng những thông tin mà bạn cung cấp khi đăng ký tài khoản để chuyển cho cơ quan chức năng giải quyết theo quy định của pháp luật.</Text>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Footer />
    </>
  )
}

export default Page