import React, { useState } from 'react';
import { Search, Package, FileText, DollarSign, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ProductLookupTool() {
  const [formData, setFormData] = useState({
    productName: '',
    brandName: '',
    upc: '',
    size: '',
    color: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Replace with your actual Flask API endpoint
      const response = await fetch('http://localhost:5001/api/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product data');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      productName: '',
      brandName: '',
      upc: '',
      size: '',
      color: ''
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Highstock Product Lookup</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Find accurate product information including MSRP, images, and descriptions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="productName" className="text-sm font-medium">
                    Product Name *
                  </Label>
                  <Input
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="e.g., Pro Filt'r Foundation"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="brandName" className="text-sm font-medium">
                    Brand Name *
                  </Label>
                  <Input
                    id="brandName"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    placeholder="e.g., Fenty Beauty"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="upc" className="text-sm font-medium">
                    UPC *
                  </Label>
                  <Input
                    id="upc"
                    name="upc"
                    value={formData.upc}
                    onChange={handleInputChange}
                    placeholder="e.g., 123456789012"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="size" className="text-sm font-medium">
                    Size (Optional)
                  </Label>
                  <Input
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., 30ml, 1oz"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="color" className="text-sm font-medium">
                    Color/Shade (Optional)
                  </Label>
                  <Input
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g., 190, Ruby Red"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search Product
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="px-6"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {error && (
              <Alert variant="destructive" className="shadow-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Product Found
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {result.image_url && (
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                      <img
                        src={result.image_url}
                        alt={result.product_name || 'Product'}
                        className="max-h-64 rounded-lg shadow-md object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Product Name</p>
                        <p className="text-lg font-semibold text-gray-900">{result.product_name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">MSRP</p>
                        <p className="text-2xl font-bold text-green-700">{result.msrp}</p>
                      </div>
                    </div>

                    {result.description && (
                      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <FileText className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600">Description</p>
                          <p className="text-gray-900 leading-relaxed">{result.description}</p>
                        </div>
                      </div>
                    )}

                    {result.match_confidence && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800">
                          Match Confidence: {result.match_confidence}%
                        </p>
                      </div>
                    )}

                    {result.source && (
                      <div className="text-xs text-gray-500 text-center">
                        Source: {result.source}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {!result && !error && !loading && (
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Enter product details and click search to find product information
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}