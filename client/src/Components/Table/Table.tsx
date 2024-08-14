import { ColumnType } from "antd/es/table";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { InputRef, PaginationProps, TableColumnType } from "antd";
import { Button, Input, Space, Table } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import "./style.css";
import { LRUCache } from "lru-cache";

interface Item {
  articleid: number;
  subarticleid: number;
  articlename: string;
  external_str_id: number;
  ecrlongname: string;
}

interface CachedData {
  records: Item[];
  total: number;
}

// Настройка LRU кэша
const cache = new LRUCache<string, CachedData>({
  max: 50, // Максимальное количество записей в кэше
  ttl: 1000 * 60 * 5, // Время жизни записи в кэше (в миллисекундах)
});

type DataIndex = keyof Item;

export const CustomTable = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  const [csv, setCsv] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async (page: number, pageSize: number) => {
    const cacheKey = `${page}-${pageSize}`;

    // Попробовать получить данные из кэша
    if (cache.has(cacheKey)) {
      console.log("Using cached data");
      const cachedData = cache.get(cacheKey);
      if (cachedData && cachedData.records && cachedData.total) {
        setCsv(cachedData.records);
        setTotal(cachedData.total);
      }
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3004/records?page=${page}&pageSize=${pageSize}`
      );
      const jsonData = await response.json();
      console.log("New data");
      cache.set(cacheKey, jsonData);
      setCsv(jsonData.records);
      setTotal(jsonData.total);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [fetchData, currentPage, pageSize]);

  const handleTableChange: PaginationProps["onChange"] = (currentPage) => {
    setCurrentPage(currentPage);
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<Item> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  // Колонки
  const Columns: ColumnType<Item>[] = [
    {
      title: "articleid",
      dataIndex: "articleid",
      width: "20%",
      sorter: (a: { articleid: number }, b: { articleid: number }) =>
        a.articleid - b.articleid,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("articleid"),
    },
    {
      title: "subarticleid",
      dataIndex: "subarticleid",
      width: "20%",
      sorter: (a: { subarticleid: number }, b: { subarticleid: number }) =>
        a.subarticleid - b.subarticleid,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("subarticleid"),
    },
    {
      title: "articlename",
      dataIndex: "articlename",
      width: "20%",
      sorter: (a: { articlename: string }, b: { articlename: any }) =>
        a.articlename.localeCompare(b.articlename),
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("articlename"),
    },
    {
      title: "external_str_id",
      dataIndex: "external_str_id",
      width: "20%",
      sorter: (
        a: { external_str_id: number },
        b: { external_str_id: number }
      ) => a.external_str_id - b.external_str_id,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("external_str_id"),
    },
    {
      title: "ecrlongname",
      dataIndex: "ecrlongname",
      width: "20%",
      sorter: (a: { articlename: string }, b: { articlename: any }) =>
        a.articlename.localeCompare(b.articlename),
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("ecrlongname"),
    },
  ];

  return (
    <div className="table-wrapper">
      <h1 className="table-name">Таблица</h1>
      {/* <Form component={false}> */}
      <Table
        className={"table-class"}
        bordered
        dataSource={csv}
        columns={Columns}
        pagination={{
          current: currentPage,
          total,
          showSizeChanger: false,
          onChange: handleTableChange,
        }}
        rowKey="subarticleid"
      />
      {/* </Form> */}
    </div>
  );
};

export default CustomTable;
