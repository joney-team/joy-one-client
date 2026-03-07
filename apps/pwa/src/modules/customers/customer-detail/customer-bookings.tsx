import { Empty } from "@/components/empty";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import QUERY_BOOKINGS from "@/modules/bookings/graphql/queryBookings.graphql";
import { useQuery } from "@apollo/client/react";
import { SimpleGrid, Skeleton, Stack } from "@mantine/core";

export const CustomerBookings = ({ customerId }: { customerId: string }) => {
  const { data, loading } = useQuery(QUERY_BOOKINGS, {
    variables: {
      query: {
        customerId,
      },
    },
  });

  const isEmpty = data && data.list && data.list.results && data.list.results.length === 0;

  return (
    <Stack>
      <SimpleGrid>
        {data?.list.results.map((booking) => (
          <BookingCard key={booking._id} booking={booking} hideCustomerInfo />
        ))}

        {loading && <Skeleton height={115} />}
        {isEmpty && <Empty />}
      </SimpleGrid>
    </Stack>
  );
};
