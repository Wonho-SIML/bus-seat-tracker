'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

// 버스 정보 타입 정의
interface BusRoute {
  id: string;
  routeName: string;
  type: string;
  routeTypeName?: string;
  startStopName: string;
  endStopName: string;
  company?: string;
}

// 데이터 페칭 함수
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // 개발자 이메일 정보
  const DEVELOPER_EMAIL = 'galdor308@gmail.com';
  
  // 버스 노선 검색 결과
  const { data, error: swrError, isLoading } = useSWR(
    isSearching && searchKeyword ? `/api/buses?keyword=${encodeURIComponent(searchKeyword)}` : null,
    fetcher
  );
  
  // 디버깅 - 데이터 확인
  useEffect(() => {
    if (data) {
      console.log('SWR 응답 데이터:', data);
    }
  }, [data]);
  
  // 검색 핸들러
  const handleSearch = () => {
    if (searchKeyword.trim()) {
      setIsSearching(true);
    }
  };
  
  // 버스 노선 선택 핸들러
  const handleSelectBus = (busId: string) => {
    router.push(`/bus/${busId}`);
  };
  
  // 문의 옵션 보여주기
  const handleShowContactOptions = () => {
    setShowContactOptions(!showContactOptions);
    if (showContactForm && !showContactOptions) {
      setShowContactForm(false);
    }
  };
  
  // 문의 폼 보여주기
  const handleShowContactForm = () => {
    setShowContactForm(true);
    setShowContactOptions(false);
  };
  
  // 이메일 클라이언트로 열기
  const handleOpenMailto = () => {
    window.open(`mailto:${DEVELOPER_EMAIL}?subject=좌석 버스 잔여석 통계 웹사이트 문의`, '_blank');
    setShowContactOptions(false);
  };
  
  // 이메일 주소 복사하기
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(DEVELOPER_EMAIL);
    alert('개발자 이메일 주소가 클립보드에 복사되었습니다.');
    setShowContactOptions(false);
  };
  
  // 문의 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });
      
      if (!res.ok) {
        throw new Error('메시지 전송에 실패했습니다. 나중에 다시 시도해주세요.');
      }
      
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '메시지 전송에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* 헤더 */}
        <header className="py-6 mb-8">
          <h1 className="text-3xl font-bold text-center text-blue-600">좌석 버스 잔여석 안내 서비스</h1>
          <p className="text-gray-600 text-center mt-2">
            좌석 버스 번호를 검색하여 시간대별 정류장 잔여석을 확인하세요
          </p>
        </header>
        
        {/* 검색 섹션 */}
        <div className="mb-10 bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="버스 번호를 입력하세요 (예: 1234)"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              검색
            </button>
          </div>
          
          {/* 검색 결과 메시지 */}
          {isSearching && searchKeyword && (
            <p className="mt-3 text-sm text-gray-600">
              &lsquo;{searchKeyword}&rsquo; 검색 결과:
            </p>
          )}
        </div>
        
        {/* 검색 결과 목록 */}
        {isLoading && (
          <div className="text-center p-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">검색 중...</p>
          </div>
        )}
        
        {swrError && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-600">
            <p>오류가 발생했습니다. 다시 시도해주세요.</p>
          </div>
        )}
        
        {data && data.busRoutes && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {data.busRoutes.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                {data.message ? (
                  <p>{data.message}</p>
                ) : (
                  <p>검색 결과가 없습니다. 다른 버스 번호를 검색해보세요.</p>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {data.busRoutes.map((bus: BusRoute) => (
                  <li 
                    key={bus.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSelectBus(bus.id)}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{bus.routeName} 번</h3>
                          <p className="text-sm text-gray-600 mt-1">{bus.routeTypeName || bus.type || '일반'}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-sm text-gray-600">{bus.startStopName} → {bus.endStopName}</p>
                          {bus.company && (
                            <p className="text-xs text-gray-500 mt-1">{bus.company}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {/* 서비스 정보 */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">서비스 안내</h2>
          <div className="text-gray-600 space-y-3">
            <p>본 서비스는 공공데이터포털 API를 활용하여 좌석 버스(2층 버스 제외) 좌석 정보를 제공합니다.</p>
            <p>주기적으로 좌석 버스 위치와 잔여석 정보를 수집하여 시간대별, 정류장별 평균 잔여석 데이터를 제공합니다.</p>
          </div>
        </div>
        
        {/* 푸터 */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 mb-2 sm:mb-0">
              © {new Date().getFullYear()} 좌석 버스 잔여석 안내 서비스. All rights reserved.
            </p>
            <div className="relative">
              <button 
                onClick={handleShowContactOptions}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-md text-sm transition-colors"
              >
                개발자에게 문의하기
              </button>
              
              {showContactOptions && (
                <div className="absolute right-0 bottom-10 mb-1 bg-white border border-gray-200 shadow-md rounded-md p-2 w-52 z-10">
                  <div className="text-xs text-gray-500 mb-2 p-1">
                    개발자 이메일:
                    <div className="flex justify-between mt-1">
                      <span className="font-medium text-gray-700">{DEVELOPER_EMAIL}</span>
                      <button 
                        onClick={handleCopyEmail}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        복사
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleShowContactForm}
                    className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    웹사이트에서 문의하기
                  </button>
                  <button
                    onClick={handleOpenMailto}
                    className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    이메일 클라이언트로 열기
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* 문의 폼 */}
          {showContactForm && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              {submitted ? (
                <div className="text-center py-4">
                  <p className="text-green-600 mb-3">문의가 성공적으로 전송되었습니다!</p>
                  <button
                    onClick={() => {
                      setShowContactForm(false);
                      setSubmitted(false);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    닫기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">개발자에게 문의하기</div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="이름"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="이메일"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="문의 내용"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 text-sm h-24 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-3 py-1.5 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
                    >
                      {submitting ? '전송 중...' : '전송하기'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
