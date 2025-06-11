import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Box, Container, Stack, Text, Title, em } from "@mantine/core";
import { NextPage } from "next";
import { Fragment } from "react";

const Page: NextPage = () => {
  return (
    <Fragment>
      <Box style={{ maxWidth: "100%", overflowX: "hidden" }}>
        <Box
          style={{
            backgroundImage: `url(/images/bg.png)`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Container size="lg" py={20} pb={100}>
            <Stack>
              <Header />

              <Title py={40} fz={em(30)} c="primary" ta="center">
                Chính sách bảo vệ thông tin cá nhân của người tiêu dùng
              </Title>

              <Text>
                Tại JoyOne, chúng tôi coi việc bảo vệ thông tin cá nhân của bạn là ưu tiên hàng đầu.
                Chúng tôi tôn trọng quyền riêng tư của người dùng và phát triển chính sách bảo mật
                này để tuyên bố cam kết của mình trong việc bảo vệ sự riêng tư của bạn. Chúng tôi
                hiểu hoàn toàn rằng thông tin cá nhân của bạn là thuộc về bạn, vì vậy chúng tôi nỗ
                lực hết sức lưu trữ bảo mật và xử lý cẩn thận thông tin mà bạn chia sẻ với chúng
                tôi. JoyOne có thể sửa đổi nội dung của chính sách bằng cách đăng một bản sửa đổi
                lên hệ thống của JoyOne, phiên bản sửa đổi có hiệu lực kể từ thời điểm đăng tải. Nếu
                người dùng tiếp tục sử dụng dịch vụ có nghĩa là bạn đã chấp nhận và chắc chắn đồng ý
                tuân theo điều khoản sử dụng mới nhất được cập nhật. Chúng tôi khuyến khích bạn đọc
                Chính sách bảo mật này một cách cẩn thận khi sử dụng Dịch vụ. Bằng cách truy cập
                Dịch vụ, bạn thừa nhận và đồng ý rằng bạn đã đọc, chấp nhận đầy đủ và sẽ tuân thủ
                Chính sách Bảo mật này.
              </Text>

              <Title order={3}>1. Mục đích thu thập thông tin cá nhân Người dùng</Title>

              <Text>
                JoyOne sử dụng thông tin thu thập từ Người dùng cho các mục đích chung sau:
              </Text>

              <ul>
                <li>Xác định và xác thực tài khoản.</li>
                <li>Cải thiện dịch vụ, chăm sóc khách hàng và nghiên cứu.</li>
                <li>Cung cấp thông tin, các dịch vụ và sự hỗ trợ theo yêu cầu của Người dùng.</li>
                <li>
                  Giải quyết các tranh chấp, các vấn đề phát sinh liên quan đến việc sử dụng website
                  JoyOne.
                </li>
                <li>
                  Ngăn chặn các hoạt động phạm pháp hoặc bị cấm được nêu trong Quy định sử dụng.
                </li>
                <li>
                  Các mục đích khác được phép theo quy định của pháp luật và JoyOne sẽ có thông báo
                  cho Người sử dụng trong từng trường hợp cụ thể.
                </li>
              </ul>

              <Text>
                Để có thể sử dụng đầy đủ các tiện ích trên sản phẩm phần mềm của JoyOne, Người dùng
                cần phải đăng ký thành viên và cung cấp các thông tin cá nhân của mình. Các thông
                tin bạn cần cung cấp cho JoyOne bao gồm:
              </Text>

              <ul>
                <li>Họ tên đầy đủ.</li>
                <li>Số điện thoại.</li>
                <li>Email chính xác.</li>
              </ul>

              <Title order={3}>2. Phạm vi sử dụng thông tin cá nhân</Title>
              <Text>
                Thông tin của Người dùng sẽ được JoyOne lưu lại trên hệ thống trong các trường hợp
                thường gặp sau:
              </Text>
              <ul>
                <li>Khi Người dùng đăng ký và/hoặc sử dụng các dịch vụ của JoyOne.</li>
                <li>
                  Khi Người dùng nộp bất cứ biểu mẫu nào, không giới hạn ở các mẫu đơn hoặc các mẫu
                  khác liên quan đến các sản phẩm và dịch vụ của JoyOne, kể cả trực tuyến hay bằng
                  các hình thức tài liệu vật lý.
                </li>
                <li>
                  Khi Người dùng ký kết bất kỳ thỏa thuận nào hoặc cung cấp bất kỳ tài liệu hoặc
                  thông tin khác liên quan đến sự tương tác của bạn với JoyOne, hoặc khi bạn sử dụng
                  sản phẩm và dịch vụ của công ty.
                </li>
                <li>
                  Khi Người dùng tương tác với JoyOne, chẳng hạn như qua điện thoại, (có thể được
                  ghi âm), thư, fax, gặp trực tiếp, mạng xã hội và email.
                </li>
                <li>
                  Khi Người dùng sử dụng các dịch vụ điện tử hoặc tương tác với JoyOne thông qua Nền
                  tảng của JoyOne hoặc sử dụng dịch vụ trên Nền tảng của JoyOne. Điều này bao gồm,
                  nhưng không giới hạn thông qua cookie JoyOne có thể triển khai khi bạn tương tác
                  với Nền tảng của JoyOne.
                </li>
                <li>
                  Khi Người dùng JoyOne thực hiện giao dịch thông qua nền tảng hoặc các dịch vụ của
                  JoyOne.
                </li>
                <li>Khi Người dùng phản hồi hoặc khiếu nại.</li>
                <li>
                  Khi Người dùng cung cấp dữ liệu cá nhân của mình cho JoyOne vì bất kỳ lý do nào.
                </li>
                <li>
                  Các trường hợp khác mà JoyOne thấy cần thiết phù hợp với quy định của pháp luật.
                </li>
              </ul>

              <Title order={3}>3. Thời gian lưu trữ thông tin Người dùng</Title>
              <Text>
                JoyOne lưu giữ và xử lý thông tin cá nhân của Người dùng trên máy chủ, bảo vệ bằng
                các biện pháp bảo vệ vật lý, điện tử bao gồm: tường lửa, mã hóa dữ liệu và thủ tục
                áp dụng theo quy định của luật bảo mật thông tin. JoyOne thực thi kiểm soát truy cập
                vật lý vào các thông tin và chỉ cho phép truy cập thông tin cá nhân đối với những
                nhân viên cần nó để hoàn thành trách nhiệm công việc của họ trong hệ thống JoyOne.
              </Text>
              <Text>
                Thông tin và tài khoản của Người dùng sẽ được lưu trữ không thời hạn trên hệ thống
                của JoyOne để bạn có thể gia hạn dịch vụ bất cứ lúc nào.
              </Text>

              <Title order={3}>4. Những người có thể tiếp cận được thông tin của Người dùng</Title>
              <Text>
                JoyOne cam kết không cung cấp, không bán, trao đổi, hoặc sử dụng các hình thức
                thương mại khác với những thông tin cá nhân của bạn. Tuy nhiên, thông tin không định
                danh của những người truy cập vào trang web có thể được sử dụng và cung cấp cho các
                bên khác nhằm mục đích marketing, quảng cáo hoặc mục đích sử dụng khác.
              </Text>
              <Text>
                Các cá nhân, tổ chức khác có thể được tiếp cận thông tin của Người dùng JoyOne trong
                một số trường hợp dưới đây:
              </Text>
              <ul>
                <li>Thông tin đó Người dùng đã công khai.</li>
                <li>JoyOne được Người dùng đồng ý tiết lộ những thông tin này.</li>
                <li>
                  Bên thứ ba mà Người dùng JoyOne ủy quyền hoặc cho phép có yêu cầu JoyOne cung cấp
                  thông tin cá nhân của Người dùng. Việc ủy quyền, cho phép phải được thể hiện bằng
                  văn bản có công chứng, chứng thực.
                </li>
                <li>
                  Theo yêu cầu pháp lý hay từ một cơ quan nhà nước hoặc nếu JoyOne tin rằng hành
                  động đó là cần thiết nhằm tuân theo các yêu cầu pháp lý hoặc chiếu theo luật pháp.
                </li>
                <li>
                  Bảo vệ quyền, lợi ích, tài sản, sự an toàn của một ai khác trên cơ sở cân bằng lợi
                  ích của tất cả các bên.
                </li>
                <li>
                  Cho các bên thứ ba khác mà JoyOne có liên doanh, liên kết để cung cấp các dịch vụ
                  trên JoyOne. Hoặc các dịch vụ mới có liên quan đến JoyOne mà Người dùng cũng đang
                  sử dụng những dịch vụ liên kết đó trên các phần mềm của JoyOne.
                </li>
                <li>
                  JoyOne được mua lại hoặc sáp nhập với công ty khác. Trong trường hợp này, JoyOne
                  sẽ thông báo cho bạn bằng email hoặc bằng cách thông báo nổi bật trên trang web
                  của JoyOne trước khi thông tin về bạn được chuyển giao và trở thành đối tượng của
                  một chính sách bảo mật khác.
                </li>
              </ul>
              <Text>
                Ngoài những trường hợp nêu trên nhưng không giới hạn, thông tin cá nhân của Người
                dùng luôn được bảo mật trước các bên thứ ba nào trừ khi JoyOne hoàn toàn tin rằng,
                sự công bố này là cần thiết nhằm ngăn chặn những thiệt hại vật chất hoặc tài chính
                do các yếu tố có dấu hiệu phạm pháp có thể gây ra.
              </Text>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Footer />
    </Fragment>
  );
};

export default Page;
