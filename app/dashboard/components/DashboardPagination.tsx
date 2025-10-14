'use client';
import { FC, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ReactPaginate from 'react-paginate';
import useDetectMobile from 'app/hook/DetectMobile';

interface PaginateProductsProps {
  per_page: string;
  page: any;
  posts: any;
}

const DashboardPagination: FC<PaginateProductsProps> = ({
  per_page,
  posts
}) => {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useDetectMobile();
  // const [pageNumber, setPageNumber] = useState(page);
  const [loadingFilter, setLoadingFilter] = useState(false);

  const page = searchParams.get('page') ? searchParams.get('page') : '1';

  const pagesnumber = posts ? Math.ceil(posts / Number(per_page)) : 1;

  let currentPage: number | string | null = 1;

  if (Number(searchParams.get('page')) >= 1) {
    currentPage = Number(searchParams.get('page'));
  }

  // let offset: number = (currentPage - 1) * Number(per_page);

  function changePage({ selected = page }: any) {
    const params = new URLSearchParams(searchParams);
    setLoadingFilter(true);
    params.set('page', selected + 1);
    replace(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    if (searchParams.get('page')) {
      // console.log("test2");
      setLoadingFilter(false);
      return;
    } else {
      // console.log("test");
      setLoadingFilter(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (loadingFilter)
      document.getElementById('amazon-products')?.classList.add('loading');
    if (!loadingFilter)
      document.getElementById('amazon-products')?.classList.remove('loading');
  }, [loadingFilter]);

  // useEffect(() => {
  //   console.log(pagesnumber);
  // }, [searchParams.get("page")]);

  return (
    <div className="flex gap-2 justify-end">
      <div>
        <ReactPaginate
          previousLabel={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          }
          nextLabel={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          }
          pageCount={pagesnumber}
          onPageChange={changePage}
          // initialPage={Number(page) - 1}
          forcePage={Number(searchParams.get('page')) - 1}
          containerClassName={
            'text-sm flex gap-4 justify-center items-center text-[var(--base-gray)] rtl'
          }
          activeClassName={
            'border border-[var(--base-blue)] text-[var(--base-blue)] rounded-sm iranSansBold'
          }
          disabledClassName={'!text-[var(--light-border)]'}
          pageLinkClassName={
            ' rounded-[3px] px-3.5 py-1.5 md:px-2 md:py-2 min-w-[30px] md:min-w-[40px] flex items-center justify-center cursor-pointer'
          }
          // renderOnZeroPageCount={null}
          pageRangeDisplayed={3}
          marginPagesDisplayed={isMobile ? 1 : 3}
        />
      </div>
    </div>
  );
};

export default DashboardPagination;
